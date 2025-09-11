import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  Users,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  averageRevenuePerUser: number;
  churnRate: number;
  lifetimeValue: number;
  revenueGrowth: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  subscribers: number;
}

interface SubscriptionDistribution {
  plan: string;
  count: number;
  revenue: number;
  color: string;
}

const FinancialDashboard = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    averageRevenuePerUser: 0,
    churnRate: 0,
    lifetimeValue: 0,
    revenueGrowth: 0,
  });

  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Simulated data - in real app, fetch from Stripe API via edge function
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 45680.50,
        monthlyRecurring: 8940.00,
        averageRevenuePerUser: 29.90,
        churnRate: 3.2,
        lifetimeValue: 890.45,
        revenueGrowth: 12.5,
      };

      const mockRevenueData: RevenueData[] = [
        { month: 'Jan', revenue: 6500, subscribers: 220 },
        { month: 'Fev', revenue: 7200, subscribers: 245 },
        { month: 'Mar', revenue: 7800, subscribers: 268 },
        { month: 'Abr', revenue: 8100, subscribers: 275 },
        { month: 'Mai', revenue: 8600, subscribers: 290 },
        { month: 'Jun', revenue: 8940, subscribers: 299 },
      ];

      const mockSubscriptionData: SubscriptionDistribution[] = [
        { plan: 'Premium', count: 180, revenue: 5382, color: '#3b82f6' },
        { plan: 'Família', count: 119, revenue: 5940, color: '#10b981' },
        { plan: 'Trial', count: 45, revenue: 0, color: '#f59e0b' },
      ];

      setMetrics(mockMetrics);
      setRevenueData(mockRevenueData);
      setSubscriptionData(mockSubscriptionData);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-secondary" />
              +{formatPercentage(metrics.revenueGrowth)} vs. mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Mensal)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {formatCurrency(metrics.monthlyRecurring)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita recorrente mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.averageRevenuePerUser)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita média por usuário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatPercentage(metrics.churnRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cancelamentos mensais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evolução da Receita</CardTitle>
            <CardDescription>
              Receita e número de assinantes ao longo do tempo
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchFinancialData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="revenue" orientation="left" />
                <YAxis yAxisId="subscribers" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'revenue' ? 'Receita' : 'Assinantes'
                  ]}
                />
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="revenue"
                />
                <Line 
                  yAxisId="subscribers"
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="subscribers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>
              Número de assinantes por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ plan, count }) => `${plan}: ${count}`}
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Plano</CardTitle>
            <CardDescription>
              Contribuição de receita por tipo de assinatura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionData.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="font-medium">{plan.plan}</span>
                    <Badge variant="secondary">{plan.count} usuários</Badge>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(plan.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Avançadas</CardTitle>
          <CardDescription>
            Indicadores de performance financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(metrics.lifetimeValue)}
              </div>
              <p className="text-sm text-muted-foreground">LTV (Lifetime Value)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {(metrics.lifetimeValue / metrics.averageRevenuePerUser).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Meses de Vida Útil</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatPercentage(metrics.revenueGrowth)}
              </div>
              <p className="text-sm text-muted-foreground">Crescimento MoM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;