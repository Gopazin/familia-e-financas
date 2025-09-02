import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  Filter,
  Eye,
  PieChart,
  LineChart
} from "lucide-react";

const Relatorios = () => {
  const reportTypes = [
    {
      icon: BarChart3,
      title: "Relatório Mensal",
      description: "Visão completa das receitas e despesas do mês",
      status: "Disponível",
      color: "bg-gradient-primary"
    },
    {
      icon: TrendingUp,
      title: "Análise de Tendências",
      description: "Compare gastos entre diferentes períodos",
      status: "Em breve",
      color: "bg-gradient-secondary"
    },
    {
      icon: PieChart,
      title: "Distribuição por Categoria",
      description: "Veja onde seu dinheiro está sendo gasto",
      status: "Disponível",
      color: "bg-gradient-success"
    },
    {
      icon: LineChart,
      title: "Projeção Financeira",
      description: "Previsões baseadas no histórico familiar",
      status: "Em breve",
      color: "bg-gradient-prosperity"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
              Relatórios Financeiros
            </h1>
            <p className="text-muted-foreground mt-1">
              Análises detalhadas para tomada de decisões inteligentes
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2 bg-gradient-primary">
              <Calendar className="w-4 h-4" />
              Este Mês
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report, index) => (
              <Card key={index} className="p-6 hover:shadow-card transition-smooth">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${report.color} flex items-center justify-center flex-shrink-0`}>
                    <report.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <Badge variant={report.status === "Disponível" ? "default" : "secondary"}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{report.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant={report.status === "Disponível" ? "default" : "outline"}
                      disabled={report.status !== "Disponível"}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {report.status === "Disponível" ? "Visualizar" : "Em Breve"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Sample Report Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prévia - Relatório Mensal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-secondary">R$ 12.500,00</p>
                <p className="text-sm text-muted-foreground">Total de Receitas</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">R$ 4.050,25</p>
                <p className="text-sm text-muted-foreground">Total de Despesas</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-foreground">R$ 8.449,75</p>
                <p className="text-sm text-muted-foreground">Saldo Líquido</p>
              </div>
            </div>
          </Card>

          {/* Coming Soon */}
          <Card className="p-8 text-center bg-gradient-prosperity text-white">
            <div className="space-y-4">
              <BarChart3 className="w-16 h-16 mx-auto opacity-80" />
              <h2 className="text-2xl font-bold">Relatórios Avançados em Desenvolvimento</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Estamos trabalhando em relatórios ainda mais detalhados e personalizáveis. 
                Continue registrando suas transações para ter dados ricos quando lançarmos!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;