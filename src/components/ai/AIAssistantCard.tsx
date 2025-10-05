import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bot, Send, Mic, Camera, Loader2, Crown, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistantCard = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isPremium = isSubscribed && (subscriptionPlan === 'premium' || subscriptionPlan === 'family');

  const handleSend = async () => {
    if (!input.trim() || !isPremium) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-transaction-processor', {
        body: {
          userInput: input,
          inputType: 'text'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Transação processada com sucesso!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.transaction_created) {
        toast({
          title: "Transação criada",
          description: "Sua transação foi registrada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-prosperity opacity-5" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Assistente IA Financeiro
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-prosperity flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Desbloqueie o Assistente IA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Registre transações por voz, texto ou foto com inteligência artificial
              </p>
            </div>
            <div className="space-y-2 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Reconhecimento de voz e texto</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>OCR de notas fiscais</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Categorização automática</span>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/pricing')}
              className="gap-2 bg-gradient-prosperity hover:opacity-90"
            >
              <Crown className="w-4 h-4" />
              Assinar Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Assistente IA
          <Badge variant="default" className="gap-1">
            <Crown className="h-3 w-3" />
            Ativo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
              <Bot className="w-12 h-12 text-primary opacity-50" />
              <div>
                <p className="text-sm font-medium">Como posso ajudar?</p>
                <p className="text-xs text-muted-foreground">
                  Diga algo como "Gastei 50 reais no supermercado"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Digite sua transação..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <Button
            size="icon"
            variant="outline"
            disabled={loading}
            onClick={() => navigate('/gestao-financeira')}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            disabled={loading}
            onClick={() => navigate('/gestao-financeira')}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Para mais recursos, acesse a <button onClick={() => navigate('/gestao-financeira')} className="text-primary hover:underline">página completa do assistente</button>
        </p>
      </CardContent>
    </Card>
  );
};
