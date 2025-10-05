import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: 'monthly' | 'category' | 'family_member' | 'patrimony' | 'comparison' | 'projection';
  period?: {
    start: string;
    end: string;
  };
  categoryId?: string;
  familyMemberId?: string;
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

    const { reportType, period, categoryId, familyMemberId }: ReportRequest = await req.json();

    console.log('Generating report:', reportType, 'for user:', user.id);

    // Define period
    const endDate = period?.end || new Date().toISOString().split('T')[0];
    const startDate = period?.start || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

    // Fetch data based on report type
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (categoryId) {
      query = query.eq('category', categoryId);
    }

    if (familyMemberId) {
      query = query.eq('family_member_id', familyMemberId);
    }

    const { data: transactions, error: transError } = await query;
    if (transError) throw transError;

    // Fetch additional context
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id);

    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id);

    const { data: netWorthData } = await supabase
      .rpc('calculate_net_worth', { target_user_id: user.id });

    const netWorth = netWorthData?.[0] || { net_worth: 0, total_assets: 0, total_liabilities: 0 };

    // Process data
    const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const balance = income - expenses;

    // Category breakdown
    const categoryBreakdown: Record<string, { amount: number; count: number; category_name?: string }> = {};
    transactions?.forEach(t => {
      if (t.type === 'expense' && t.category) {
        if (!categoryBreakdown[t.category]) {
          const cat = categories?.find(c => c.name === t.category);
          categoryBreakdown[t.category] = { 
            amount: 0, 
            count: 0,
            category_name: cat?.name || t.category
          };
        }
        categoryBreakdown[t.category].amount += Number(t.amount);
        categoryBreakdown[t.category].count += 1;
      }
    });

    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([name, data]) => ({
        name: data.category_name || name,
        amount: data.amount,
        count: data.count,
        percentage: (data.amount / expenses * 100).toFixed(1)
      }));

    // Daily average
    const daysDiff = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAvgExpense = expenses / daysDiff;

    // Prepare data summary
    const dataSummary = {
      reportType,
      period: { start: startDate, end: endDate, days: daysDiff },
      financial: {
        income,
        expenses,
        balance,
        dailyAvgExpense,
        transactionCount: transactions?.length || 0
      },
      categories: topCategories,
      patrimony: {
        netWorth: Number(netWorth.net_worth),
        assets: Number(netWorth.total_assets),
        liabilities: Number(netWorth.total_liabilities)
      },
      familyMemberCount: familyMembers?.length || 0
    };

    console.log('Data prepared for AI:', dataSummary);

    // Generate AI report
    const systemPrompt = getSystemPrompt(reportType);
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Gere um relatório detalhado com base nestes dados:\n\n${JSON.stringify(dataSummary, null, 2)}`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const reportContent = aiData.choices[0].message.content;

    console.log('Report generated successfully');

    // Structure the report
    const report = {
      id: crypto.randomUUID(),
      type: reportType,
      period: dataSummary.period,
      generated_at: new Date().toISOString(),
      user_id: user.id,
      data: dataSummary,
      content: reportContent,
      visualizations: generateVisualizations(dataSummary)
    };

    return new Response(
      JSON.stringify(report),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in report-generator:', error);
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

function getSystemPrompt(reportType: string): string {
  const basePrompt = `Você é um analista financeiro expert que gera relatórios detalhados e acionáveis em português brasileiro.

Estruture sua resposta em formato markdown com as seguintes seções:

# Resumo Executivo
Breve panorama da situação financeira (2-3 parágrafos)

# Análise Detalhada
Análise aprofundada dos números, tendências e padrões identificados

# Destaques Principais
- Pontos positivos (com 💚)
- Pontos de atenção (com ⚠️)
- Oportunidades de melhoria (com 💡)

# Recomendações Práticas
Lista numerada de ações específicas e práticas

# Projeções
Previsões para o próximo período baseadas nos dados atuais

Use linguagem clara, empática e motivadora. Inclua números específicos e percentuais relevantes.`;

  const specificPrompts: Record<string, string> = {
    monthly: basePrompt + '\n\nFoco: Análise mensal completa com comparação temporal.',
    category: basePrompt + '\n\nFoco: Análise profunda de gastos por categoria específica.',
    family_member: basePrompt + '\n\nFoco: Análise de gastos e padrões de um membro específico da família.',
    patrimony: basePrompt + '\n\nFoco: Análise de evolução patrimonial (ativos vs passivos).',
    comparison: basePrompt + '\n\nFoco: Comparação entre períodos e tendências temporais.',
    projection: basePrompt + '\n\nFoco: Projeções futuras e planejamento financeiro.'
  };

  return specificPrompts[reportType] || basePrompt;
}

function generateVisualizations(data: any) {
  return {
    pieChart: {
      title: 'Distribuição por Categoria',
      data: data.categories.map((c: any) => ({
        name: c.name,
        value: c.amount,
        percentage: c.percentage
      }))
    },
    barChart: {
      title: 'Receitas vs Despesas',
      data: [
        { name: 'Receitas', value: data.financial.income, color: '#10b981' },
        { name: 'Despesas', value: data.financial.expenses, color: '#ef4444' }
      ]
    },
    metrics: {
      savingsRate: data.financial.income > 0 
        ? ((data.financial.balance / data.financial.income) * 100).toFixed(1)
        : '0',
      dailyAverage: data.financial.dailyAvgExpense.toFixed(2),
      categoryCount: data.categories.length,
      transactionCount: data.financial.transactionCount
    }
  };
}
