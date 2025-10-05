import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, Info, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  type: 'alert' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

const AIInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('dashboard-insights', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
        if (isRefresh) {
          toast({
            title: "Insights atualizados",
            description: "Análise financeira atualizada com sucesso!",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Erro ao carregar insights",
        description: "Não foi possível gerar a análise financeira.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-secondary" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-warning" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getPriorityColor = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Insights Inteligentes</h3>
            <p className="text-sm text-muted-foreground">Análise financeira com IA</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center shadow-card">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Insights Inteligentes</h3>
            <p className="text-sm text-muted-foreground">Análise financeira com IA</p>
          </div>
        </div>
        <Button
          onClick={() => fetchInsights(true)}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum insight disponível no momento.</p>
            <p className="text-sm">Adicione transações para receber análises personalizadas.</p>
          </div>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-smooth hover:shadow-card ${
                insight.priority === 'high' 
                  ? 'bg-destructive/5 border-destructive/20' 
                  : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(insight.type)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(insight.priority)}`}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.message}
                  </p>
                  {insight.action && (
                    <p className="text-sm font-medium text-primary">
                      💡 {insight.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default AIInsights;
