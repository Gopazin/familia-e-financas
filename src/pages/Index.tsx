import Navigation from "@/components/navigation/Navigation";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SpendingChart from "@/components/dashboard/SpendingChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, TrendingUp, Users, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                Dashboard Familiar
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe a saúde financeira da sua família em tempo real
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="gap-2 bg-gradient-primary hover:bg-primary shadow-primary">
                <PlusCircle className="w-4 h-4" />
                Nova Transação
              </Button>
              <Button variant="outline" className="gap-2">
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
              <Button variant="outline" className="h-16 gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-secondary-light flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-secondary-dark" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Adicionar Receita</p>
                  <p className="text-sm text-muted-foreground">Salário, mesada, extras</p>
                </div>
              </Button>
              <Button variant="outline" className="h-16 gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-primary-dark" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Registrar Gasto</p>
                  <p className="text-sm text-muted-foreground">Contas, compras, lazer</p>
                </div>
              </Button>
              <Button variant="outline" className="h-16 gap-3 justify-start">
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
                <Button variant="secondary" className="gap-2">
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
