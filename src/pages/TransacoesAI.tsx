import React from 'react';
import Navigation from '@/components/navigation/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AITransactionChat } from '@/components/ai/AITransactionChat';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, Sparkles, Mic, Camera, MessageSquare, Crown } from 'lucide-react';

const TransacoesAI = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  
  const isPremiumUser = () => {
    return isSubscribed && (subscriptionPlan === 'premium' || subscriptionPlan === 'family');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl lg:ml-64">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Assistente IA Financeiro
                </h1>
                {isPremiumUser() && (
                  <Badge variant="default" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                {isPremiumUser() 
                  ? "Registre suas transações usando inteligência artificial"
                  : "Funcionalidade disponível para assinantes Premium/Family"
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <AITransactionChat />
          </div>

          {/* Sidebar with Features and Tips */}
          <div className="space-y-6">
            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Funcionalidades IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Chat Inteligente</h4>
                    <p className="text-sm text-muted-foreground">
                      Fale naturalmente sobre suas finanças
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Reconhecimento de Voz</h4>
                    <p className="text-sm text-muted-foreground">
                      Grave mensagens de áudio
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">OCR de Notas Fiscais</h4>
                    <p className="text-sm text-muted-foreground">
                      Envie fotos de comprovantes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exemplos de Uso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">💬 Texto</p>
                  <p className="text-xs text-muted-foreground">
                    "Gastei 45 reais no Uber hoje"
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">🎤 Áudio</p>
                  <p className="text-xs text-muted-foreground">
                    Grave: "Almoço no restaurante, 35 reais"
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">📸 Imagem</p>
                  <p className="text-xs text-muted-foreground">
                    Foto da nota fiscal ou comprovante
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Integration */}
            {isPremiumUser() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">WhatsApp Bot</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Registre transações diretamente pelo WhatsApp!
                  </p>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">
                      📱 Número: (11) 9999-9999
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Vincule seu número nas configurações
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dicas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Seja específico com valores e categorias</p>
                <p>• Mencione datas quando relevante</p>
                <p>• Fotos devem ter boa qualidade e legibilidade</p>
                <p>• Confirme sempre as sugestões antes de salvar</p>
                <p>• Use o formulário manual como backup</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransacoesAI;