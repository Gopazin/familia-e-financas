import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Suggestion {
  id: string;
  transaction_id: string;
  suggestion_type: string;
  original_value: string | null;
  suggested_value: any;
  confidence_score: number;
  transactions?: {
    description: string;
    amount: number;
    date: string;
  };
}

const SuggestionsReview = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_suggestions')
        .select(`
          *,
          transactions:transaction_id (
            description,
            amount,
            date
          )
        `)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const runCuration = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { error } = await supabase.functions.invoke('data-curator', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "✨ Curadoria concluída",
        description: "Suas transações foram analisadas!",
      });

      fetchSuggestions();
    } catch (error) {
      console.error('Error running curation:', error);
      toast({
        title: "Erro na curadoria",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSuggestion = async (suggestionId: string, accept: boolean) => {
    setProcessing(suggestionId);
    try {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      if (accept) {
        // Apply suggestion
        if (suggestion.suggestion_type === 'category') {
          await supabase
            .from('transactions')
            .update({
              category: suggestion.suggested_value.category,
              auto_categorized: true
            })
            .eq('id', suggestion.transaction_id);
        } else if (suggestion.suggestion_type === 'recurring') {
          await supabase
            .from('transactions')
            .update({
              is_recurring: true,
              recurrence_pattern: suggestion.suggested_value.pattern,
              metadata: suggestion.suggested_value
            })
            .eq('id', suggestion.transaction_id);
        }

        // Learn pattern
        if (suggestion.suggestion_type === 'category' && suggestion.transactions) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('transaction_patterns')
              .insert({
                user_id: user.id,
                pattern_type: 'category',
                pattern_key: suggestion.transactions.description,
                pattern_value: suggestion.suggested_value,
                confidence_score: suggestion.confidence_score
              });
          }
        }
      }

      // Update suggestion status
      await supabase
        .from('transaction_suggestions')
        .update({
          status: accept ? 'accepted' : 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', suggestionId);

      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

      toast({
        title: accept ? "✅ Sugestão aplicada" : "❌ Sugestão rejeitada",
        description: accept ? "Padrão aprendido com sucesso!" : "Sugestão descartada",
      });
    } catch (error) {
      console.error('Error handling suggestion:', error);
      toast({
        title: "Erro ao processar sugestão",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Sugestões Inteligentes</h3>
            <p className="text-sm text-muted-foreground">
              {suggestions.length} sugestões aguardando revisão
            </p>
          </div>
        </div>
        <Button
          onClick={runCuration}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Analisar Transações
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma sugestão pendente</p>
          <p className="text-sm">Clique em "Analisar Transações" para gerar sugestões</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 border border-border rounded-lg bg-card hover:shadow-card transition-smooth"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.suggestion_type === 'category' ? '🏷️ Categoria' : 
                       suggestion.suggestion_type === 'duplicate' ? '🔄 Duplicata' :
                       suggestion.suggestion_type === 'recurring' ? '📅 Recorrente' : '💡 Outro'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        suggestion.confidence_score >= 0.85 
                          ? 'bg-secondary/10 text-secondary border-secondary/20'
                          : 'bg-warning/10 text-warning border-warning/20'
                      }`}
                    >
                      {(suggestion.confidence_score * 100).toFixed(0)}% confiança
                    </Badge>
                  </div>

                  {suggestion.transactions && (
                    <p className="font-medium text-foreground mb-1">
                      {suggestion.transactions.description}
                    </p>
                  )}

                  {suggestion.suggestion_type === 'category' && (
                    <p className="text-sm text-muted-foreground">
                      Sugestão: <span className="font-medium text-primary">{suggestion.suggested_value.category}</span>
                      {suggestion.suggested_value.reason && (
                        <span className="text-xs block mt-1">💡 {suggestion.suggested_value.reason}</span>
                      )}
                    </p>
                  )}

                  {suggestion.suggestion_type === 'recurring' && (
                    <p className="text-sm text-muted-foreground">
                      Detectada recorrência: <span className="font-medium text-primary">{suggestion.suggested_value.pattern}</span>
                      {' '}({suggestion.suggested_value.occurrences} ocorrências)
                    </p>
                  )}

                  {suggestion.suggestion_type === 'duplicate' && (
                    <p className="text-sm text-muted-foreground">
                      Possível duplicata: {suggestion.suggested_value.reason}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSuggestion(suggestion.id, true)}
                    disabled={processing === suggestion.id}
                    size="sm"
                    className="gap-2 bg-secondary hover:bg-secondary/90"
                  >
                    {processing === suggestion.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Aceitar
                  </Button>
                  <Button
                    onClick={() => handleSuggestion(suggestion.id, false)}
                    disabled={processing === suggestion.id}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SuggestionsReview;
