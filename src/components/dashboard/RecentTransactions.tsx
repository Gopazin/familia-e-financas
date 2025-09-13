import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpCircle, ArrowDownCircle, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";

const RecentTransactions = () => {
  const { toast } = useToast();
  const { transactions, loading } = useTransactions();
  
  const handleViewAll = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A visualização completa de transações estará disponível em breve!",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpCircle className="w-5 h-5" />;
      case 'expense': return <ArrowDownCircle className="w-5 h-5" />;
      default: return <ArrowUpCircle className="w-5 h-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income': return "bg-secondary-light text-secondary-dark";
      case 'expense': return "bg-primary-light text-primary-dark";
      default: return "bg-secondary-light text-secondary-dark";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income': return "text-secondary";
      case 'expense': return "text-primary";
      default: return "text-secondary";
    }
  };

  // Show recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Transações Recentes</h3>
        <Button onClick={handleViewAll} variant="outline" size="sm" className="gap-2">
          <Eye className="w-4 h-4" />
          Ver Todas
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando transações...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione sua primeira transação!</p>
          </div>
        ) : (
          recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    {transaction.category && (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                    {transaction.family_member && (
                      <span className="text-xs text-muted-foreground">
                        {transaction.family_member.name} ({transaction.family_member.role})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {transaction.type === "income" ? "+" : "-"}R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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