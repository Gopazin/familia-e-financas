import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Eye } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import type { Transaction } from "@/types";

const RecentTransactions = () => {
  const { profile } = useAuth();
  const { transactions, loading } = useTransactions();
  
  // Show only recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Faça login para ver suas transações</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          Ver Todas
        </Button>
      </div>

      <div className="space-y-4">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Comece adicionando sua primeira transação!</p>
          </div>
        ) : (
          recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === "receita" 
                  ? "bg-secondary-light text-secondary-dark" 
                  : "bg-primary-light text-primary-dark"
              }`}>
                {transaction.type === "receita" ? (
                  <ArrowUpCircle className="w-5 h-5" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5" />
                )}
              </div>
              
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category?.name || 'Sem categoria'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {transaction.family_member?.name || 'Sem responsável'}
                    </span>
                  </div>
                </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === "receita" ? "text-secondary" : "text-primary"
              }`}>
                {transaction.type === "receita" ? "+" : "-"}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default RecentTransactions;