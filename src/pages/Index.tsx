import Navigation from "@/components/navigation/Navigation";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SpendingChart from "@/components/dashboard/SpendingChart";
import AdminAccessButton from "@/components/admin/AdminAccessButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, TrendingUp, Users, Sparkles, Crown, Clock } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isSubscribed, subscriptionPlan } = useAuth();

  const handleNewTransaction = () => {
    navigate("/transacoes");
  };

  const handleViewReports = () => {
    navigate("/relatorios");
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} selecionada`,
      description: "Você será redirecionado para a página de transações.",
    });
    setTimeout(() => navigate("/transacoes"), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                  Dashboard Familiar
                </h1>
                {isSubscribed ? (
                  <Badge className="bg-gradient-secondary text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    {subscriptionPlan === 'premium' ? 'Premium' : 'Família'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-primary border-primary">
                    <Clock className="w-3 h-3 mr-1" />
                    Teste Grátis
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Bem-vindo, {user?.user_metadata?.full_name || user?.email}! 
                {!isSubscribed && ' Você está no período de teste gratuito.'}
              </p>
            </div>
            <div className="flex gap-3">
              <AdminAccessButton />
              <Button onClick={handleNewTransaction} className="gap-2 bg-gradient-primary hover:bg-primary shadow-primary">
                <PlusCircle className="w-4 h-4" />
                Nova Transação
              </Button>
              <Button onClick={handleViewReports} variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Relatório
              </Button>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <FinancialSummary />

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => handleQuickAction("Adicionar Receita")} variant="outline" className="h-16 gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-secondary-light flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-secondary-dark" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Adicionar Receita</p>
                  <p className="text-sm text-muted-foreground">Salário, mesada, extras</p>
                </div>
              </Button>
              <Button onClick={() => handleQuickAction("Registrar Gasto")} variant="outline" className="h-16 gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-primary-dark" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Registrar Gasto</p>
                  <p className="text-sm text-muted-foreground">Contas, compras, lazer</p>
                </div>
              </Button>
              <Button onClick={() => navigate("/familia")} variant="outline" className="h-16 gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Gerenciar Família</p>
                  <p className="text-sm text-muted-foreground">Perfis e permissões</p>
                </div>
              </Button>
            </div>
          </Card>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions />
            <SpendingChart />
          </div>

          {/* Educational Section Preview */}
          <Card className="p-6 bg-gradient-prosperity text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Educação Financeira</h3>
                </div>
                <p className="text-white/90">
                  "A educação financeira é o melhor investimento que uma família pode fazer. 
                  Prepare-se para descobrir dicas e desafios que transformarão sua relação com o dinheiro!"
                </p>
                <Button onClick={() => navigate("/educacao")} variant="secondary" className="gap-2">
                  Explorar em Breve
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
