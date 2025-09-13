import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpCircle, ArrowDownCircle, Save, Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useState } from "react";
import { useTransactions, TransactionType } from "@/hooks/useTransactions";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useAuth } from "@/contexts/AuthContext";

const Transacoes = () => {
  const [transactionType, setTransactionType] = useState<TransactionType>("income");
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    family_member_id: "",
    date: new Date().toISOString().split('T')[0],
    observation: ""
  });
  
  const { toast } = useToast();
  const { isSubscribed, subscriptionPlan } = useAuth();
  const { createTransaction, monthlyStats, loading } = useTransactions();
  const { familyMembers } = useFamilyMembers();

  const handleSaveTransaction = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a descrição da transação.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const success = await createTransaction({
      type: transactionType,
      description: formData.description.trim(),
      amount: Number(formData.amount),
      category: formData.category || undefined,
      family_member_id: formData.family_member_id || undefined,
      date: formData.date,
      observation: formData.observation || undefined,
    });

    if (success) {
      // Reset form
      setFormData({
        description: "",
        amount: "",
        category: "",
        family_member_id: "",
        date: new Date().toISOString().split('T')[0],
        observation: ""
      });
    }
  };

  const handleQuickCategory = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    toast({
      title: `Categoria "${category}" selecionada`,
      description: "A categoria foi preenchida no formulário automaticamente.",
    });
  };

  const categories = {
    income: ["Salário", "Mesada", "Freelance", "Investimentos", "Bônus", "Rendimentos", "Vendas", "Outros"],
    expense: ["Alimentação", "Transporte", "Lazer", "Contas Fixas", "Educação", "Saúde", "Compras", "Casa", "Outros"]
  };

  // Check if premium features are available
  const isPremiumFeature = (feature: string) => {
    if (!isSubscribed) return true;
    if (subscriptionPlan === 'free') return true;
    return false;
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'income': return <ArrowUpCircle className="w-4 h-4" />;
      case 'expense': return <ArrowDownCircle className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'income': return "bg-gradient-secondary";
      case 'expense': return "bg-gradient-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
              Gerenciar Transações
            </h1>
            <p className="text-muted-foreground mt-1">
              Registre receitas e despesas de forma rápida e organizada
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transaction Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Nova Transação</h2>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-border bg-muted">
                    {(["income", "expense"] as TransactionType[]).map((type) => (
                      <Button
                        key={type}
                        variant={transactionType === type ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTransactionType(type)}
                        className={`h-10 ${transactionType === type ? getTransactionColor(type) : ""}`}
                      >
                        {getTransactionIcon(type)}
                        <span className="ml-2 capitalize">
                          {type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        id="description"
                        placeholder="Ex: Salário do mês, Supermercado..."
                        className="h-11"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="h-11"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories[transactionType].map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select 
                        value={formData.family_member_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, family_member_id: value }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Quem fez a transação?" />
                        </SelectTrigger>
                        <SelectContent>
                          {familyMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <div className="relative">
                        <Input
                          id="date"
                          type="date"
                          className="h-11"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observation">Observação (opcional)</Label>
                    <Textarea
                      id="observation"
                      placeholder="Adicione detalhes sobre esta transação..."
                      className="resize-none"
                      rows={3}
                      value={formData.observation}
                      onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                    />
                  </div>

                  <Button 
                    onClick={handleSaveTransaction} 
                    className="w-full gap-2 bg-gradient-prosperity hover:bg-secondary shadow-success"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Salvando..." : "Salvar Transação"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Stats & Tips */}
            <div className="space-y-6">
              {/* Month Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Resumo do Mês</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Receitas</span>
                    <span className="font-semibold text-secondary">
                      +R$ {monthlyStats.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Despesas</span>
                    <span className="font-semibold text-primary">
                      -R$ {monthlyStats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Saldo</span>
                      <span className={`font-bold text-lg ${monthlyStats.saldo >= 0 ? 'text-secondary' : 'text-primary'}`}>
                        R$ {Math.abs(monthlyStats.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Categorias Populares</h3>
                <div className="space-y-3">
                  {categories[transactionType].slice(0, 5).map((category) => (
                    <Button
                      key={category}
                      onClick={() => handleQuickCategory(category)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start gap-2 h-9"
                    >
                      <Plus className="w-3 h-3" />
                      {category}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Tip */}
              <Card className="p-6 bg-gradient-prosperity text-white">
                <h3 className="font-semibold mb-2">💡 Dica do Dia</h3>
                <p className="text-sm text-white/90">
                  Registre suas transações diariamente para ter controle total das suas finanças!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transacoes;