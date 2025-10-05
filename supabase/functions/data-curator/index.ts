import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionPattern {
  pattern_key: string;
  pattern_value: any;
  confidence_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log('Starting data curation for user:', user.id);

    // Fetch user transactions and patterns
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100);

    const { data: patterns } = await supabase
      .from('transaction_patterns')
      .select('*')
      .eq('user_id', user.id);

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No transactions to curate', suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${transactions.length} transactions`);

    const suggestions: any[] = [];

    // 1. Auto-categorization
    for (const transaction of transactions) {
      if (!transaction.category || transaction.category === null) {
        // Check learned patterns
        const matchingPattern = patterns?.find(p => 
          p.pattern_type === 'category' &&
          transaction.description?.toLowerCase().includes(p.pattern_key.toLowerCase())
        );

        if (matchingPattern) {
          suggestions.push({
            user_id: user.id,
            transaction_id: transaction.id,
            suggestion_type: 'category',
            original_value: transaction.category,
            suggested_value: matchingPattern.pattern_value,
            confidence_score: matchingPattern.confidence_score
          });
        } else {
          // Use AI for categorization
          const aiSuggestion = await suggestCategoryWithAI(
            transaction.description,
            categories || [],
            LOVABLE_API_KEY
          );

          if (aiSuggestion) {
            suggestions.push({
              user_id: user.id,
              transaction_id: transaction.id,
              suggestion_type: 'category',
              original_value: transaction.category,
              suggested_value: aiSuggestion,
              confidence_score: aiSuggestion.confidence
            });
          }
        }
      }
    }

    // 2. Detect duplicates
    for (let i = 0; i < transactions.length - 1; i++) {
      const t1 = transactions[i];
      const t2 = transactions[i + 1];

      const isSimilar = 
        Math.abs(Number(t1.amount) - Number(t2.amount)) < 0.01 &&
        t1.type === t2.type &&
        t1.description?.toLowerCase().trim() === t2.description?.toLowerCase().trim() &&
        Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime()) < 86400000 * 3; // 3 days

      if (isSimilar) {
        suggestions.push({
          user_id: user.id,
          transaction_id: t1.id,
          suggestion_type: 'duplicate',
          original_value: null,
          suggested_value: {
            duplicate_of: t2.id,
            reason: 'Mesma descrição, valor e data próxima'
          },
          confidence_score: 0.85
        });
      }
    }

    // 3. Detect recurring transactions
    const transactionGroups = new Map<string, any[]>();
    for (const t of transactions) {
      const key = `${t.description}_${t.amount}_${t.type}`;
      if (!transactionGroups.has(key)) {
        transactionGroups.set(key, []);
      }
      transactionGroups.get(key)!.push(t);
    }

    for (const [key, group] of transactionGroups) {
      if (group.length >= 2) {
        const dates = group.map(t => new Date(t.date).getTime()).sort();
        const intervals: number[] = [];
        
        for (let i = 1; i < dates.length; i++) {
          intervals.push(dates[i] - dates[i - 1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const isConsistent = intervals.every(i => Math.abs(i - avgInterval) < 86400000 * 5); // 5 days variance

        if (isConsistent && !group[0].is_recurring) {
          const daysDiff = Math.round(avgInterval / 86400000);
          let pattern = 'mensal';
          
          if (daysDiff >= 25 && daysDiff <= 35) pattern = 'mensal';
          else if (daysDiff >= 12 && daysDiff <= 16) pattern = 'quinzenal';
          else if (daysDiff >= 5 && daysDiff <= 9) pattern = 'semanal';

          suggestions.push({
            user_id: user.id,
            transaction_id: group[0].id,
            suggestion_type: 'recurring',
            original_value: null,
            suggested_value: {
              pattern,
              interval_days: daysDiff,
              occurrences: group.length
            },
            confidence_score: 0.90
          });
        }
      }
    }

    // Save high-confidence suggestions automatically
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence_score >= 0.90);
    
    for (const suggestion of highConfidenceSuggestions) {
      if (suggestion.suggestion_type === 'category') {
        await supabase
          .from('transactions')
          .update({
            category: suggestion.suggested_value.category,
            auto_categorized: true
          })
          .eq('id', suggestion.transaction_id);

        // Learn pattern
        await supabase
          .from('transaction_patterns')
          .upsert({
            user_id: user.id,
            pattern_type: 'category',
            pattern_key: transactions.find(t => t.id === suggestion.transaction_id)?.description || '',
            pattern_value: suggestion.suggested_value,
            confidence_score: suggestion.confidence_score
          });
      } else if (suggestion.suggestion_type === 'recurring') {
        await supabase
          .from('transactions')
          .update({
            is_recurring: true,
            recurrence_pattern: suggestion.suggested_value.pattern,
            metadata: suggestion.suggested_value
          })
          .eq('id', suggestion.transaction_id);
      }
    }

    // Save medium-confidence suggestions for review
    const reviewSuggestions = suggestions.filter(s => s.confidence_score < 0.90 && s.confidence_score >= 0.70);
    
    if (reviewSuggestions.length > 0) {
      await supabase
        .from('transaction_suggestions')
        .insert(reviewSuggestions);
    }

    console.log(`Created ${highConfidenceSuggestions.length} auto-applied suggestions and ${reviewSuggestions.length} for review`);

    return new Response(
      JSON.stringify({
        message: 'Data curation completed',
        applied: highConfidenceSuggestions.length,
        pending: reviewSuggestions.length,
        suggestions: reviewSuggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in data-curator:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function suggestCategoryWithAI(
  description: string,
  categories: any[],
  apiKey: string
): Promise<any> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de categorização financeira. 
            
Categorias disponíveis:
${categories.map(c => `- ${c.name} (${c.type}): ${c.emoji}`).join('\n')}

Analise a descrição da transação e sugira a categoria mais apropriada.
Retorne APENAS um JSON válido:
{
  "category": "nome_da_categoria",
  "confidence": 0.85,
  "reason": "motivo da escolha"
}`
          },
          {
            role: 'user',
            content: `Descrição: ${description}`
          }
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content);
  } catch (error) {
    console.error('AI categorization error:', error);
    return null;
  }
}
