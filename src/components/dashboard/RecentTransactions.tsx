import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, Eye } from "lucide-react";

interface Transaction {
  id: string;
  type: "receita" | "despesa";
  description: string;
  amount: number;
  category: string;
  date: string;
  user: string;
}

const RecentTransactions = () => {
  // Mock data - seria substituído por dados reais
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "receita",
      description: "Salário - João",
      amount: 5500.00,
      category: "Salário",
      date: "2024-01-15",
      user: "João (Pai)"
    },
    {
      id: "2",
      type: "despesa",
      description: "Supermercado",
      amount: 320.50,
      category: "Alimentação",
      date: "2024-01-14",
      user: "Maria (Mãe)"
    },
    {
      id: "3",
      type: "receita",
      description: "Freelance - Design",
      amount: 800.00,
      category: "Trabalho Extra",
      date: "2024-01-13",
      user: "Maria (Mãe)"
    },
    {
      id: "4",
      type: "despesa",
      description: "Conta de Luz",
      amount: 180.75,
      category: "Contas Fixas",
      date: "2024-01-12",
      user: "João (Pai)"
    },
    {
      id: "5",
      type: "despesa",
      description: "Material Escolar",
      amount: 95.30,
      category: "Educação",
      date: "2024-01-11",
      user: "Ana (Filha)"
    }
  ];

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
        {transactions.map((transaction) => (
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
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {transaction.user}
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
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;