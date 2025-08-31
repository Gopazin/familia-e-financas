import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  percentage?: number;
  gradientClass: string;
}

const SummaryCard = ({ title, amount, icon: Icon, trend, percentage, gradientClass }: SummaryCardProps) => (
  <Card className="p-6 transition-smooth hover:shadow-card">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">
          R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        {trend && percentage && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-secondary' : 'text-destructive'
          }`}>
            {trend === 'up' ? 
              <TrendingUp className="w-4 h-4" /> : 
              <TrendingDown className="w-4 h-4" />
            }
            <span>{percentage}% vs mês anterior</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-full ${gradientClass} flex items-center justify-center shadow-card`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

const FinancialSummary = () => {
  // Mock data - seria substituído por dados reais
  const summaryData = [
    {
      title: "Saldo Total",
      amount: 8450.75,
      icon: DollarSign,
      trend: "up" as const,
      percentage: 5.2,
      gradientClass: "bg-gradient-prosperity"
    },
    {
      title: "Receitas do Mês",
      amount: 12500.00,
      icon: TrendingUp,
      trend: "up" as const,
      percentage: 3.1,
      gradientClass: "bg-gradient-secondary"
    },
    {
      title: "Gastos do Mês",
      amount: 4050.25,
      icon: TrendingDown,
      trend: "down" as const,
      percentage: 8.3,
      gradientClass: "bg-gradient-primary"
    },
    {
      title: "Meta de Economia",
      amount: 2000.00,
      icon: Target,
      gradientClass: "bg-gradient-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryData.map((data, index) => (
        <SummaryCard key={index} {...data} />
      ))}
    </div>
  );
};

export default FinancialSummary;