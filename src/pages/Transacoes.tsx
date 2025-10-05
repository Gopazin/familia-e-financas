import React, { useState } from 'react';
import Navigation from '@/components/navigation/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions, TransactionType, CreateTransactionData } from '@/hooks/useTransactions';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionList } from '@/components/transactions/TransactionList';
import { QuickTransactionForm } from '@/components/transactions/QuickTransactionForm';
import { CategoryManager } from '@/components/transactions/CategoryManager';
import SuggestionsReview from '@/components/transactions/SuggestionsReview';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Lightbulb, List, Settings, Zap, Bot, Mic, Camera, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Transacoes = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  const { createTransaction, loading, monthlyStats } = useTransactions();
  const { familyMembers } = useFamilyMembers();
  const { categories, getCategoriesByType } = useCategories();
  
  const [currentType, setCurrentType] = useState<TransactionType>('expense');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    familyMember: '',
    date: new Date().toISOString().split('T')[0],
    observation: ''
  });

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      return;
    }

    const success = await createTransaction({
      type: currentType,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category || undefined,
      family_member_id: formData.familyMember || undefined,
      date: formData.date,
      observation: formData.observation || undefined,
    });

    if (success) {
      // Reset form
      setFormData({
        description: '',
        amount: '',
        category: '',
        familyMember: '',
        date: new Date().toISOString().split('T')[0],
        observation: ''
      });
    }
  };

  // Check if premium features are available
  const isPremiumFeature = () => {
    return isSubscribed && (subscriptionPlan === 'premium' || subscriptionPlan === 'family');
  };

  // Get categories for current type
  const availableCategories = getCategoriesByType(currentType);

  const getTransactionIcon = (type: TransactionType) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTransactionColor = (type: TransactionType) => {
    return type === 'income' ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl lg:ml-64">{/* Added lg:ml-64 for desktop sidebar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Central de Transações</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Controle completo das suas finanças
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isPremiumFeature() && (
                <Button 
                  onClick={() => window.location.href = '/transacoes-ai'}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="hidden sm:inline">Assistente IA</span>
                  <span className="sm:hidden">IA</span>
                </Button>
              )}
              <QuickTransactionForm />
            </div>
          </div>
        </div>

        {/* AI Integration Banner for Premium Users */}
        {isPremiumFeature() && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Assistente IA Financeiro</h3>
                    <p className="text-sm text-muted-foreground">
                      Registre transações por voz, texto ou foto. Deixe a IA organizar suas finanças!
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={() => window.location.href = '/transacoes-ai'}
                    className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1 sm:flex-none"
                  >
                    <Sparkles className="h-4 w-4" />
                    Usar IA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="transactions" className="gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Lista & Filtros</span>
              <span className="sm:hidden">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="form" className="gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Formulário Manual</span>
              <span className="sm:hidden">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Categorias</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            {/* Monthly Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Receitas</p>
                      <p className="text-lg sm:text-2xl font-bold text-success">
                        R$ {monthlyStats.receitas.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-success flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Despesas</p>
                      <p className="text-lg sm:text-2xl font-bold text-destructive">
                        R$ {monthlyStats.despesas.toFixed(2)}
                      </p>
                    </div>
                    <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-destructive flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Saldo</p>
                      <p className={`text-lg sm:text-2xl font-bold ${monthlyStats.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
                        R$ {monthlyStats.saldo.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">% Categorizado</p>
                      <p className="text-lg sm:text-2xl font-bold">85%</p>
                    </div>
                    <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <SuggestionsReview />

            <TransactionList />
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Transaction Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-6 w-6" />
                        Formulário Manual
                      </div>
                      {isPremiumFeature() && (
                        <Button 
                          onClick={() => window.location.href = '/transacoes-ai'}
                          variant="outline" 
                          size="sm" 
                          className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                          <Bot className="h-4 w-4" />
                          Usar IA
                        </Button>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {isPremiumFeature() 
                        ? "Formulário tradicional para quando preferir inserir dados manualmente ou quando a IA estiver indisponível."
                        : "Registre suas transações usando o formulário completo abaixo."
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Transaction Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={currentType === 'income' ? 'default' : 'outline'}
                        onClick={() => setCurrentType('income')}
                        className="h-12 text-base"
                      >
                        <TrendingUp className="mr-2 h-5 w-5" />
                        Receita
                      </Button>
                      <Button
                        type="button"
                        variant={currentType === 'expense' ? 'default' : 'outline'}
                        onClick={() => setCurrentType('expense')}
                        className="h-12 text-base"
                      >
                        <TrendingDown className="mr-2 h-5 w-5" />
                        Despesa
                      </Button>
                    </div>

                    <form onSubmit={handleSaveTransaction} className="space-y-6">
                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Input
                          id="description"
                          placeholder={`Descreva sua ${currentType === 'income' ? 'receita' : 'despesa'}...`}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">Valor *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span className="flex items-center gap-2">
                                  <span>{cat.emoji}</span>
                                  <span>{cat.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Family Member (if premium) */}
                      {isPremiumFeature() && familyMembers.length > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="familyMember">Responsável</Label>
                          <Select value={formData.familyMember} onValueChange={(value) => setFormData(prev => ({ ...prev, familyMember: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o responsável" />
                            </SelectTrigger>
                            <SelectContent>
                              {familyMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Date */}
                      <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>

                      {/* Observation */}
                      <div className="space-y-2">
                        <Label htmlFor="observation">Observação</Label>
                        <Textarea
                          id="observation"
                          placeholder="Informações adicionais (opcional)"
                          value={formData.observation}
                          onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      {/* Submit Button */}
                      <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Transação'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Popular Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categorias Populares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                      {availableCategories.filter(cat => cat.is_favorite).slice(0, 6).map((category) => (
                        <Button
                          key={category.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                          className="justify-start h-auto p-3"
                        >
                          <span className="mr-2">{category.emoji}</span>
                          <span className="text-xs">{category.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Features or Tips */}
                {isPremiumFeature() ? (
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Funcionalidades IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mic className="h-4 w-4 text-purple-600" />
                        <span>Comando por voz</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="h-4 w-4 text-purple-600" />
                        <span>Foto de recibos</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Bot className="h-4 w-4 text-purple-600" />
                        <span>Processamento inteligente</span>
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/transacoes-ai'}
                        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        size="sm"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Experimentar IA
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Dica do Dia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        💡 Use o lançamento rápido para registrar gastos na hora. Depois pode editar diretamente na lista para adicionar mais detalhes.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Transacoes;