import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    link: string;
    caption?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Helper function to send WhatsApp message
    async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
      if (!whatsappToken || !whatsappPhoneId) {
        console.error('WhatsApp credentials not configured');
        return;
      }

      const message: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      };

      try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('WhatsApp send error:', error);
        } else {
          console.log('WhatsApp message sent successfully');
        }
      } catch (error) {
        console.error('Error sending WhatsApp message:', error);
      }
    }

    // Helper function to get media URL from WhatsApp
    async function getWhatsAppMediaUrl(mediaId: string): Promise<string | null> {
      if (!whatsappToken) {
        return null;
      }

      try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
          headers: {
            'Authorization': `Bearer ${whatsappToken}`
          }
        });

        if (response.ok) {
          const mediaData = await response.json();
          return mediaData.url;
        }
      } catch (error) {
        console.error('Error getting WhatsApp media URL:', error);
      }
      
      return null;
    }

    // Webhook verification for WhatsApp
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_WEBHOOK_TOKEN')) {
        console.log('WhatsApp webhook verified');
        return new Response(challenge);
      }
      
      return new Response('Verification failed', { status: 403 });
    }

    // Handle incoming WhatsApp messages
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('WhatsApp webhook payload:', JSON.stringify(body, null, 2));

      // Extract message data
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const messageData = changes?.value?.messages?.[0];

      if (!messageData) {
        return new Response('No message data', { status: 200 });
      }

      const fromNumber = messageData.from;
      const messageText = messageData.text?.body || '';
      const messageType = messageData.type;

      console.log('Processing WhatsApp message:', { fromNumber, messageText, messageType });

      // Find user by phone number (you may need to create a phone_number field in profiles)
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('phone_number', fromNumber)
        .single();

      if (!profile) {
        // Send registration message
        await sendWhatsAppMessage(fromNumber, 
          '👋 Olá! Para usar o assistente financeiro via WhatsApp, você precisa primeiro se cadastrar em nosso app e vincular seu número de telefone.\n\nAcesse: [SEU_APP_URL]'
        );
        return new Response('User not found', { status: 200 });
      }

      // Check if user has premium subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status, trial_end')
        .eq('user_id', profile.user_id)
        .single();

      const hasAccess = subscription && 
        (subscription.status === 'active' || 
         (subscription.status === 'trial' && new Date(subscription.trial_end) > new Date())) &&
        ['premium', 'family'].includes(subscription.plan);

      if (!hasAccess) {
        await sendWhatsAppMessage(fromNumber, 
          '🔒 O assistente financeiro via WhatsApp está disponível apenas para assinantes Premium/Family.\n\nFaça upgrade em nosso app!'
        );
        return new Response('Access denied', { status: 200 });
      }

      // Process message with AI
      let inputContent = messageText;
      let inputType: 'text' | 'image' = 'text';

      // Handle image messages
      if (messageType === 'image') {
        const imageId = messageData.image?.id;
        if (imageId) {
          // Download image from WhatsApp
          const imageUrl = await getWhatsAppMediaUrl(imageId);
          if (imageUrl) {
            inputContent = imageUrl;
            inputType = 'image';
          }
        }
      }

      // Call AI processor
      const { data: aiResponse } = await supabase.functions.invoke('ai-transaction-processor', {
        body: {
          input: inputContent,
          type: inputType,
          user_id: profile.user_id
        }
      });

      let responseMessage = aiResponse?.response || 'Desculpe, não consegui processar sua mensagem.';

      // Add transaction confirmation if created
      if (aiResponse?.transaction_created) {
        const type = aiResponse.type === 'income' ? 'receita' : 'despesa';
        responseMessage += `\n\n💰 ${type.charAt(0).toUpperCase() + type.slice(1)} de R$ ${aiResponse.amount?.toFixed(2)} registrada com sucesso!`;
      }

      // Send response back to WhatsApp
      await sendWhatsAppMessage(fromNumber, responseMessage);

      return new Response('Message processed', { status: 200 });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return new Response('Internal error', { status: 500 });
  }
});