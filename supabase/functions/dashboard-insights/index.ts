import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Fetching financial data for user:', user.id);

    // Fetch last 90 days of transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', threeMonthsAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (transError) throw transError;

    // Fetch net worth data
    const { data: netWorthData, error: netWorthError } = await supabase
      .rpc('calculate_net_worth', { target_user_id: user.id });

    if (netWorthError) throw netWorthError;

    // Prepare data summary for AI
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthTransactions = transactions?.filter(t => 
      new Date(t.date).getMonth() === currentMonth
    ) || [];
    
    const lastMonthTransactions = transactions?.filter(t => 
      new Date(t.date).getMonth() === lastMonth
    ) || [];

    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const lastExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Get category breakdown
    const categoryBreakdown: Record<string, number> = {};
    currentMonthTransactions.forEach(t => {
      if (t.type === 'expense' && t.category) {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      }
    });

    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    const netWorth = netWorthData?.[0] || { 
      total_assets: 0, 
      total_liabilities: 0, 
      net_worth: 0 
    };

    const dataSummary = {
      currentMonth: {
        income: currentIncome,
        expenses: currentExpenses,
        balance: currentIncome - currentExpenses,
        transactionCount: currentMonthTransactions.length
      },
      lastMonth: {
        income: lastIncome,
        expenses: lastExpenses,
        balance: lastIncome - lastExpenses
      },
      topExpenseCategories: topCategories,
      patrimony: {
        totalAssets: Number(netWorth.total_assets),
        totalLiabilities: Number(netWorth.total_liabilities),
        netWorth: Number(netWorth.net_worth)
      },
      trends: {
        incomeChange: lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome * 100) : 0,
        expensesChange: lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses * 100) : 0
      }
    };

    console.log('Data summary prepared:', dataSummary);

    // Call Lovable AI for insights
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente financeiro inteligente. Analise os dados financeiros e gere insights práticos e personalizados em português.
            
Forneça exatamente 4 insights no seguinte formato JSON:
{
  "insights": [
    {
      "type": "alert|success|warning|info",
      "title": "Título curto e direto",
      "message": "Mensagem clara e acionável",
      "action": "Ação sugerida (opcional)",
      "priority": "high|medium|low"
    }
  ]
}

Tipos de insights a considerar:
- Alertas sobre gastos acima da média
- Padrões positivos de economia
- Sugestões de otimização
- Comparações temporais
- Análises de categorias
- Previsões baseadas em tendências

Seja específico com números e percentuais reais dos dados fornecidos.`
          },
          {
            role: 'user',
            content: `Analise estes dados financeiros e gere 4 insights relevantes:

${JSON.stringify(dataSummary, null, 2)}

Forneça insights práticos e acionáveis em português brasileiro.`
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
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI response received:', aiContent);

    // Parse AI response
    let insights;
    try {
      const parsed = JSON.parse(aiContent);
      insights = parsed.insights;
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback insights
      insights = [
        {
          type: 'info',
          title: 'Dados Analisados',
          message: `Analisamos ${currentMonthTransactions.length} transações este mês.`,
          priority: 'medium'
        }
      ];
    }

    return new Response(
      JSON.stringify({ 
        insights,
        summary: dataSummary 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dashboard-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        insights: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
