import React, { useState, useEffect } from 'react';
import Navigation from '@/components/navigation/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AITransactionChat } from '@/components/ai/AITransactionChat';
import { PatrimonyDashboard } from '@/components/patrimony/PatrimonyDashboard';
import { TransactionList } from '@/components/transactions/TransactionList';
import { QuickTransactionForm } from '@/components/transactions/QuickTransactionForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, Crown, Lock, Wallet, TrendingUp, List, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const GestaoFinanceira = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  const navigate = useNavigate();
  const [assistantName, setAssistantName] = useState('Assistente Financeiro');
  const [familyName, setFamilyName] = useState('');
  
  const isPremiumUser = () => {
    return isSubscribed && (subscriptionPlan === 'premium' || subscriptionPlan === 'family');
  };

  // Load assistant name from settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      const { data } = await (supabase as any)
        .from('user_settings')
        .select('assistant_name, family_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        if (data.assistant_name) {
          setAssistantName(data.assistant_name);
        } else if (data.family_name) {
          setFamilyName(data.family_name);
          setAssistantName(`Assistente da Família ${data.family_name}`);
        }
      }
    };
    
    loadSettings();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl lg:ml-64">
        {/* Header minimalista */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-prosperity flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {assistantName}
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
                  ? "Seu assistente pessoal para gestão financeira completa"
                  : "Assine Premium para desbloquear o assistente completo"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Chat do Assistente - Prioridade */}
        {isPremiumUser() ? (
          <div className="space-y-6">
            {/* Chat principal */}
            <div className="mb-8">
              <AITransactionChat />
            </div>

            {/* Detalhes e outras funcionalidades abaixo */}
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions" className="gap-2">
                  <List className="h-4 w-4" />
                  Transações
                </TabsTrigger>
                <TabsTrigger value="patrimony" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Patrimônio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4 mt-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Histórico de Transações</h2>
                  <QuickTransactionForm />
                </div>
                <TransactionList />
              </TabsContent>

              <TabsContent value="patrimony" className="mt-6">
                <PatrimonyDashboard />
              </TabsContent>
            </Tabs>
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
                  O Assistente Financeiro completo está disponível apenas para assinantes Premium e Family
                </p>
              </div>

              <div className="grid gap-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Assistente IA</p>
                    <p className="text-xs text-muted-foreground">Conversação natural</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Gestão Completa</p>
                    <p className="text-xs text-muted-foreground">Transações e patrimônio</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Controle Total</p>
                    <p className="text-xs text-muted-foreground">Tudo em um só lugar</p>
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

export default GestaoFinanceira;
