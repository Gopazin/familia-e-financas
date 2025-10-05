import React from 'react';
import Navigation from '@/components/navigation/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AITransactionChat } from '@/components/ai/AITransactionChat';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Mic, Camera, MessageSquare, Crown, ArrowLeft, Lock } from 'lucide-react';

const TransacoesAI = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  const navigate = useNavigate();
  
  const isPremiumUser = () => {
    return isSubscribed && (subscriptionPlan === 'premium' || subscriptionPlan === 'family');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl lg:ml-64">
        {/* Header simplificado */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-prosperity flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Assistente IA Completo
                </h1>
                {isPremiumUser() && (
                  <Badge variant="default" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPremiumUser() 
                  ? "Registre transações por voz, texto ou foto"
                  : "Assine Premium para desbloquear todos os recursos"
                }
              </p>
            </div>
          </div>
        </div>

        {isPremiumUser() ? (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Chat principal - 3 colunas */}
            <div className="lg:col-span-3">
              <AITransactionChat />
            </div>

            {/* Sidebar compacta - 1 coluna */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Chat inteligente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    <span>Voz e áudio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span>OCR de notas</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Exemplos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium mb-1">💬 Texto</p>
                    <p className="text-muted-foreground">"Gastei R$ 45 no Uber"</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium mb-1">🎤 Voz</p>
                    <p className="text-muted-foreground">"Almoço R$ 35"</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium mb-1">📸 Foto</p>
                    <p className="text-muted-foreground">Nota fiscal/recibo</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  <p>• Seja específico</p>
                  <p>• Mencione valores</p>
                  <p>• Confirme sugestões</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-prosperity flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Recurso Premium</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  O Assistente IA completo está disponível apenas para assinantes Premium e Family
                </p>
              </div>

              <div className="grid gap-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Chat Inteligente</p>
                    <p className="text-xs text-muted-foreground">Fale naturalmente</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mic className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Reconhecimento de Voz</p>
                    <p className="text-xs text-muted-foreground">Grave áudios</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Camera className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">OCR de Notas</p>
                    <p className="text-xs text-muted-foreground">Fotos de recibos</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/pricing')}
                size="lg"
                className="gap-2 bg-gradient-prosperity hover:opacity-90"
              >
                <Crown className="w-5 h-5" />
                Assinar Premium Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransacoesAI;