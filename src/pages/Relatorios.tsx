import { useState } from 'react';
import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  Sparkles,
  PieChart,
  LineChart,
  Users,
  Loader2,
  FileText,
  TrendingDown
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Report {
  id: string;
  type: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  generated_at: string;
  data: any;
  content: string;
  visualizations: any;
}

const Relatorios = () => {
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const { toast } = useToast();

  const reportTypes = [
    {
      id: 'monthly',
      icon: BarChart3,
      title: "Relatório Mensal",
      description: "Visão completa das receitas e despesas do mês",
      color: "bg-gradient-primary"
    },
    {
      id: 'category',
      icon: PieChart,
      title: "Análise por Categoria",
      description: "Veja onde seu dinheiro está sendo gasto",
      color: "bg-gradient-success"
    },
    {
      id: 'comparison',
      icon: TrendingUp,
      title: "Comparação Temporal",
      description: "Compare gastos entre diferentes períodos",
      color: "bg-gradient-secondary"
    },
    {
      id: 'projection',
      icon: LineChart,
      title: "Projeção Financeira",
      description: "Previsões baseadas no histórico",
      color: "bg-gradient-prosperity"
    },
    {
      id: 'patrimony',
      icon: TrendingDown,
      title: "Análise Patrimonial",
      description: "Evolução de ativos e passivos",
      color: "bg-gradient-primary"
    },
    {
      id: 'family_member',
      icon: Users,
      title: "Análise Familiar",
      description: "Gastos por membro da família",
      color: "bg-gradient-secondary"
    }
  ];

  const generateReport = async (reportType: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('report-generator', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          reportType,
          period: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        }
      });

      if (error) throw error;

      setCurrentReport(data);
      
      toast({
        title: "✨ Relatório gerado!",
        description: "Seu relatório está pronto para visualização.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!currentReport) return;

    const reportText = `# Relatório Financeiro - ${currentReport.type}\n\n` +
      `Período: ${currentReport.period.start} a ${currentReport.period.end}\n\n` +
      `${currentReport.content}\n\n` +
      `---\n\n` +
      `Gerado em: ${new Date(currentReport.generated_at).toLocaleString('pt-BR')}`;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${currentReport.type}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Download concluído",
      description: "Relatório salvo em formato Markdown",
    });
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                Relatórios Inteligentes
              </h1>
              <p className="text-muted-foreground mt-1">
                Análises geradas por IA para decisões mais inteligentes
              </p>
            </div>
            {currentReport && (
              <Button onClick={downloadReport} className="gap-2">
                <Download className="w-4 h-4" />
                Baixar Relatório
              </Button>
            )}
          </div>

          {!currentReport ? (
            <>
              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report) => (
                  <Card key={report.id} className="p-6 hover:shadow-card transition-smooth">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-full ${report.color} flex items-center justify-center`}>
                        <report.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      <Button 
                        onClick={() => generateReport(report.id)}
                        disabled={loading}
                        className="w-full gap-2 bg-gradient-primary"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Gerar com IA
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Info Card */}
              <Card className="p-8 text-center bg-gradient-prosperity text-white">
                <div className="space-y-4">
                  <Sparkles className="w-16 h-16 mx-auto" />
                  <h2 className="text-2xl font-bold">Relatórios Gerados por IA</h2>
                  <p className="text-white/90 max-w-2xl mx-auto">
                    Selecione um tipo de relatório acima para gerar análises detalhadas, insights personalizados 
                    e recomendações práticas usando inteligência artificial.
                  </p>
                </div>
              </Card>
            </>
          ) : (
            <Tabs defaultValue="report" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="report" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Relatório
                </TabsTrigger>
                <TabsTrigger value="visualizations" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Visualizações
                </TabsTrigger>
                <TabsTrigger value="data" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Dados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {reportTypes.find(r => r.id === currentReport.type)?.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(currentReport.period.start).toLocaleDateString('pt-BR')} - {new Date(currentReport.period.end).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-secondary">Gerado por IA</Badge>
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{currentReport.content}</ReactMarkdown>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={() => setCurrentReport(null)} variant="outline">
                    Novo Relatório
                  </Button>
                  <Button onClick={downloadReport} className="gap-2">
                    <Download className="w-4 h-4" />
                    Baixar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="visualizations" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">{currentReport.visualizations.pieChart.title}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={currentReport.visualizations.pieChart.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {currentReport.visualizations.pieChart.data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </Card>

                  {/* Bar Chart */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">{currentReport.visualizations.barChart.title}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={currentReport.visualizations.barChart.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Taxa de Economia</p>
                    <p className="text-2xl font-bold text-secondary">
                      {currentReport.visualizations.metrics.savingsRate}%
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Média Diária</p>
                    <p className="text-2xl font-bold text-foreground">
                      R$ {currentReport.visualizations.metrics.dailyAverage}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Categorias</p>
                    <p className="text-2xl font-bold text-primary">
                      {currentReport.visualizations.metrics.categoryCount}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Transações</p>
                    <p className="text-2xl font-bold text-foreground">
                      {currentReport.visualizations.metrics.transactionCount}
                    </p>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Dados Brutos</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Receitas</p>
                        <p className="text-xl font-bold text-secondary">
                          R$ {currentReport.data.financial.income.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Despesas</p>
                        <p className="text-xl font-bold text-destructive">
                          R$ {currentReport.data.financial.expenses.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                        <p className={`text-xl font-bold ${currentReport.data.financial.balance >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                          R$ {currentReport.data.financial.balance.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium mb-3">Top Categorias</h4>
                      <div className="space-y-2">
                        {currentReport.data.categories.map((cat: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{cat.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">R$ {cat.amount.toFixed(2)}</span>
                              <Badge variant="outline">{cat.percentage}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
