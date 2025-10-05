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

    const { command, currentPage } = await req.json();

    if (!command) {
      throw new Error("No command provided");
    }

    console.log('Processing voice command:', command, 'Current page:', currentPage);

    // Fetch user context for better responses
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    const { data: netWorthData } = await supabase
      .rpc('calculate_net_worth', { target_user_id: user.id });

    const netWorth = netWorthData?.[0] || { net_worth: 0 };

    // Call Lovable AI to parse command
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
            content: `Você é um assistente financeiro inteligente que processa comandos de voz.

Contexto do usuário:
- Página atual: ${currentPage}
- Patrimônio líquido: R$ ${Number(netWorth.net_worth).toFixed(2)}
- Últimas transações: ${transactions?.length || 0}

Analise o comando e retorne APENAS um JSON válido no seguinte formato:
{
  "action": "navigate|create_transaction|show_info|search|error",
  "target": "página de destino ou null",
  "params": {
    "type": "income ou expense",
    "amount": número,
    "description": "string",
    "category": "string",
    "info": "resposta textual"
  },
  "response": "resposta em português para o usuário"
}

Exemplos de comandos e respostas:
- "ir para transações" → action: "navigate", target: "/transacoes"
- "adicionar receita de 5000" → action: "create_transaction", params: {type: "income", amount: 5000}
- "quanto gastei" → action: "show_info", params: {info: "..."}
- "mostrar patrimônio" → action: "navigate", target: "/patrimonio"
- "criar relatório" → action: "navigate", target: "/relatorios"
- "ver família" → action: "navigate", target: "/familia"

Seja inteligente e entenda variações do português brasileiro.`
          },
          {
            role: 'user',
            content: command
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
    
    console.log('AI response:', aiContent);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiContent);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      parsedResponse = {
        action: 'error',
        response: 'Desculpe, não consegui entender o comando.'
      };
    }

    // If it's a transaction creation, create it
    if (parsedResponse.action === 'create_transaction' && parsedResponse.params) {
      const { type, amount, description, category } = parsedResponse.params;
      
      if (type && amount) {
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type,
            amount,
            description: description || 'Transação por voz',
            category: category || null,
            date: new Date().toISOString().split('T')[0]
          });

        if (insertError) {
          console.error('Error creating transaction:', insertError);
          parsedResponse.response = 'Erro ao criar transação: ' + insertError.message;
        } else {
          parsedResponse.response = `✅ Transação criada: ${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${amount.toFixed(2)}`;
        }
      }
    }

    // If it's a show_info action, fetch relevant data
    if (parsedResponse.action === 'show_info') {
      const currentMonth = new Date().getMonth();
      const monthTransactions = transactions?.filter(t => 
        new Date(t.date).getMonth() === currentMonth
      ) || [];

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      parsedResponse.params = {
        ...parsedResponse.params,
        income,
        expenses,
        balance: income - expenses,
        netWorth: Number(netWorth.net_worth)
      };

      parsedResponse.response = `📊 Resumo Financeiro:\n\n` +
        `💰 Receitas: R$ ${income.toFixed(2)}\n` +
        `💸 Despesas: R$ ${expenses.toFixed(2)}\n` +
        `📈 Saldo: R$ ${(income - expenses).toFixed(2)}\n` +
        `🏆 Patrimônio: R$ ${Number(netWorth.net_worth).toFixed(2)}`;
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in voice-command-router:', error);
    return new Response(
      JSON.stringify({ 
        action: 'error',
        response: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
