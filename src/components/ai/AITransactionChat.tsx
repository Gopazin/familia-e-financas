import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mic, 
  MicOff, 
  Send, 
  Upload, 
  Camera, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Crown,
  Lock
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'audio' | 'image';
  timestamp: Date;
  metadata?: {
    transaction_created?: boolean;
    transaction_id?: string;
    amount?: number;
    category?: string;
  };
}

interface TransactionSuggestion {
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  confidence: number;
}

export const AITransactionChat = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<TransactionSuggestion | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check if user has premium access
  const isPremiumUser = () => {
    return isSubscribed && (subscriptionPlan === 'premium' || subscriptionPlan === 'family');
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && isPremiumUser()) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: '👋 Olá! Eu sou seu assistente financeiro inteligente. Você pode me falar sobre suas receitas e despesas de forma natural. Por exemplo: "Gastei 45 reais no Uber hoje" ou "Recebi 3000 de salário". Também posso processar fotos de notas fiscais!',
        type: 'text',
        timestamp: new Date()
      }]);
    }
  }, [isPremiumUser()]);

  // Process AI response
  const processAITransaction = async (userInput: string, inputType: 'text' | 'audio' | 'image' = 'text') => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-transaction-processor', {
        body: {
          input: userInput,
          type: inputType,
          user_id: user?.id
        }
      });

      if (error) throw error;

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        type: 'text',
        timestamp: new Date(),
        metadata: data.transaction_created ? {
          transaction_created: true,
          transaction_id: data.transaction_id,
          amount: data.amount,
          category: data.category
        } : undefined
      };

      setMessages(prev => [...prev, aiMessage]);

      // If there's a suggestion, show it
      if (data.suggestion && !data.transaction_created) {
        setSuggestion(data.suggestion);
      }

      if (data.transaction_created) {
        toast({
          title: "💰 Transação criada!",
          description: `${data.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${data.amount.toFixed(2)} foi registrada.`,
        });
      }

    } catch (error) {
      console.error('AI processing error:', error);
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text input
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      type: 'text',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');

    await processAITransaction(currentInput, 'text');
  };

  // Handle file upload (images)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas imagens.",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      // Add user message with image
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: '📸 Imagem enviada',
        type: 'image',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      await processAITransaction(base64, 'image');
    };
    
    reader.readAsDataURL(file);
  };

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64 = reader.result as string;
          
          // Add user message
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: '🎤 Mensagem de áudio',
            type: 'audio',
            timestamp: new Date()
          };

          setMessages(prev => [...prev, userMessage]);
          await processAITransaction(base64, 'audio');
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Erro no microfone",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Confirm AI suggestion
  const confirmSuggestion = async () => {
    if (!suggestion) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-transaction-processor', {
        body: {
          confirm_suggestion: true,
          suggestion: suggestion,
          user_id: user?.id
        }
      });

      if (error) throw error;

      setSuggestion(null);
      
      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '✅ Transação confirmada e salva com sucesso!',
        type: 'text',
        timestamp: new Date(),
        metadata: {
          transaction_created: true,
          transaction_id: data.transaction_id,
          amount: suggestion.amount,
          category: suggestion.category
        }
      };

      setMessages(prev => [...prev, confirmMessage]);
      
      toast({
        title: "💰 Transação confirmada!",
        description: `${suggestion.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${suggestion.amount.toFixed(2)} foi registrada.`,
      });

    } catch (error) {
      toast({
        title: "Erro ao confirmar",
        description: "Não foi possível salvar a transação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Premium feature gate
  if (!isPremiumUser()) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
            <Crown className="h-6 w-6" />
            <CardTitle>Assistente IA Premium</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span>Funcionalidade disponível apenas para assinantes Premium/Family</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>🤖 Chat com Inteligência Artificial</p>
            <p>🎤 Reconhecimento de voz</p>
            <p>📸 OCR de notas fiscais</p>
            <p>💬 Processamento de linguagem natural</p>
          </div>
          <Button className="mt-4">
            Fazer Upgrade para Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Chat Messages */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Assistente Financeiro IA
            <Badge variant="outline" className="text-xs">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'assistant' ? '' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'assistant' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-xs ${
                    message.role === 'assistant' ? 'text-left' : 'text-right'
                  }`}>
                    <div className={`inline-block p-3 rounded-lg text-sm ${
                      message.role === 'assistant'
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {message.content}
                      
                      {message.metadata?.transaction_created && (
                        <div className="mt-2 flex items-center gap-1 text-xs opacity-75">
                          <CheckCircle className="h-3 w-3" />
                          Transação salva
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Processando...
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AI Suggestion */}
      {suggestion && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-800">Confirmação necessária</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {suggestion.type === 'income' ? 'Receita' : 'Despesa'} de{' '}
                  <strong>R$ {suggestion.amount.toFixed(2)}</strong> - {suggestion.category}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Confiança: {Math.round(suggestion.confidence * 100)}%
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={confirmSuggestion} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Confirmar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSuggestion(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Digite ou fale sobre sua transação..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={isRecording ? 'bg-red-100 border-red-300' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleSendMessage} disabled={!inputText.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            💡 Dica: Fale naturalmente! "Gastei 30 reais no almoço" ou envie foto da nota fiscal
          </div>
        </CardContent>
      </Card>
    </div>
  );
};