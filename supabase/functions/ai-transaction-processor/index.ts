import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionRequest {
  input: string;
  type: 'text' | 'audio' | 'image';
  user_id: string;
  confirm_suggestion?: boolean;
  suggestion?: any;
  conversation_history?: Array<{ role: string; content: string }>;
}

interface TransactionSuggestion {
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date?: string;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      input, 
      type, 
      user_id, 
      confirm_suggestion, 
      suggestion,
      conversation_history = []
    }: TransactionRequest = await req.json();

    console.log('AI Transaction Processor - Request:', { 
      type, 
      user_id, 
      confirm_suggestion,
      conversation_messages: conversation_history.length 
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle suggestion confirmation
    if (confirm_suggestion && suggestion) {
      console.log('Confirming suggestion:', suggestion);
      
      const { data: transaction, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user_id,
          type: suggestion.type,
          description: suggestion.description,
          amount: suggestion.amount,
          category: suggestion.category,
          date: suggestion.date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating transaction:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          transaction_id: transaction.id,
          response: '✅ Transação confirmada e salva com sucesso!'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    let processedInput = input;

    // Process different input types
    if (type === 'audio') {
      console.log('Processing audio input');
      // Convert audio to text using Whisper
      const audioResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: (() => {
          const formData = new FormData();
          // Convert base64 to blob
          const base64Data = input.split(',')[1];
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          const audioBlob = new Blob([bytes], { type: 'audio/wav' });
          formData.append('file', audioBlob, 'audio.wav');
          formData.append('model', 'whisper-1');
          formData.append('language', 'pt');
          return formData;
        })(),
      });

      if (!audioResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const audioResult = await audioResponse.json();
      processedInput = audioResult.text;
      console.log('Audio transcription:', processedInput);

    } else if (type === 'image') {
      console.log('Processing image input');
      // Process image with GPT-4 Vision for OCR
      const imageAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em extrair informações financeiras de imagens. Analise a imagem e extraia todas as informações relevantes sobre transações financeiras, como valores, produtos, estabelecimentos, datas, etc. Responda em português.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extraia todas as informações financeiras desta imagem (nota fiscal, comprovante, etc.)'
                },
                {
                  type: 'image_url',
                  image_url: { url: input }
                }
              ]
            }
          ],
          max_tokens: 500
        }),
      });

      if (!imageAnalysisResponse.ok) {
        throw new Error('Failed to analyze image');
      }

      const imageResult = await imageAnalysisResponse.json();
      processedInput = imageResult.choices[0].message.content;
      console.log('Image analysis:', processedInput);
    }

    // Get user's categories for better categorization
    const { data: categories } = await supabase
      .from('categories')
      .select('name, type')
      .eq('user_id', user_id);

    const categoryList = categories?.map(cat => `${cat.name} (${cat.type})`).join(', ') || 
      'Alimentação, Transporte, Moradia, Saúde, Lazer, Salário, Freelance';

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `Você é um assistente financeiro especializado em processar transações.
        
SUAS RESPONSABILIDADES:
1. Analisar texto sobre transações financeiras em português brasileiro
2. Extrair informações estruturadas (tipo, valor, categoria, descrição, data)
3. Responder de forma amigável e confirmar o entendimento
4. Sugerir transações quando há informações suficientes
5. Manter contexto da conversa para responder perguntas de acompanhamento

CATEGORIAS DISPONÍVEIS: ${categoryList}

FORMATO DE RESPOSTA:
- Se conseguir identificar uma transação clara: responda em JSON structured output
- Se precisar de esclarecimentos: faça perguntas específicas
- Sempre seja amigável e natural
- Use o contexto da conversa anterior para entender melhor o usuário

EXEMPLOS DE ENTRADA:
"Gastei 45 reais no Uber" → Despesa R$ 45,00, Categoria: Transporte
"Recebi 3000 de salário" → Receita R$ 3000,00, Categoria: Salário
"Almoço 35 reais" → Despesa R$ 35,00, Categoria: Alimentação

Se você identificar uma transação válida, responda SEMPRE neste formato JSON:
{
  "has_transaction": true,
  "transaction": {
    "type": "income" ou "expense",
    "description": "descrição clara",
    "amount": valor_numérico,
    "category": "categoria_identificada",
    "date": "YYYY-MM-DD ou null",
    "confidence": 0.0_a_1.0
  },
  "response": "mensagem amigável para o usuário"
}

Se NÃO conseguir identificar uma transação, responda:
{
  "has_transaction": false,
  "response": "mensagem pedindo esclarecimentos ou cumprimento"
}`
      },
      // Add conversation history (limit to last 10 messages to avoid token limits)
      ...conversation_history.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: processedInput
      }
    ];

    // Process with GPT-4 to extract transaction information
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_completion_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResult = await aiResponse.json();
    const parsedResponse = JSON.parse(aiResult.choices[0].message.content);
    
    console.log('AI Response:', parsedResponse);

    // If AI identified a transaction with high confidence, create it automatically
    if (parsedResponse.has_transaction && 
        parsedResponse.transaction.confidence > 0.8 && 
        parsedResponse.transaction.amount > 0) {
      
      console.log('Auto-creating high-confidence transaction');
      
      const { data: transaction, error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user_id,
          type: parsedResponse.transaction.type,
          description: parsedResponse.transaction.description,
          amount: parsedResponse.transaction.amount,
          category: parsedResponse.transaction.category,
          date: parsedResponse.transaction.date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating transaction:', insertError);
        // If insert fails, return suggestion instead
        return new Response(
          JSON.stringify({
            success: true,
            response: `${parsedResponse.response}\n\n⚠️ Houve um erro ao salvar. Você pode tentar novamente ou usar o formulário manual.`,
            suggestion: parsedResponse.transaction
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          response: `✅ ${parsedResponse.response}\n\nTransação registrada automaticamente!`,
          transaction_created: true,
          transaction_id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If transaction identified but lower confidence, return as suggestion
    if (parsedResponse.has_transaction) {
      return new Response(
        JSON.stringify({
          success: true,
          response: parsedResponse.response,
          suggestion: parsedResponse.transaction
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No transaction identified, just return the conversational response
    return new Response(
      JSON.stringify({
        success: true,
        response: parsedResponse.response
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI transaction processor:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Pode tentar novamente ou usar o formulário manual?'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});