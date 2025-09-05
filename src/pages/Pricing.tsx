import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Zap, ArrowLeft } from 'lucide-react';

const Pricing = () => {
  const { user, isSubscribed, subscriptionPlan } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '7 dias de teste',
      description: 'Perfeito para começar a organizar suas finanças',
      features: [
        'Dashboard básico',
        'Até 50 transações',
        'Relatórios simples',
        'Suporte por email',
      ],
      limitations: [
        'Funcionalidades limitadas',
        'Sem backup automático',
        'Sem múltiplos usuários',
      ],
      popular: false,
      cta: 'Começar Teste Grátis',
      variant: 'outline' as const,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 29,90',
      period: 'por mês',
      description: 'Todas as funcionalidades para controle financeiro completo',
      features: [
        'Dashboard avançado com métricas',
        'Transações ilimitadas',
        'Relatórios detalhados em PDF',
        'Categorização automática com IA',
        'Metas e planejamento financeiro',
        'Backup automático na nuvem',
        'Suporte prioritário',
        'Exportação de dados',
      ],
      popular: true,
      cta: 'Escolher Premium',
      variant: 'default' as const,
    },
    {
      id: 'family',
      name: 'Família',
      price: 'R$ 49,90',
      period: 'por mês',
      description: 'Ideal para famílias que querem controle financeiro conjunto',
      features: [
        'Tudo do plano Premium',
        'Até 6 membros da família',
        'Permissões personalizadas',
        'Dashboard compartilhado',
        'Relatórios familiares consolidados',
        'Chat de suporte dedicado',
        'Consultoria financeira mensal',
        'Controle parental de gastos',
      ],
      popular: false,
      cta: 'Escolher Família',
      variant: 'secondary' as const,
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!user && planId !== 'free') {
      navigate('/auth');
      return;
    }

    if (planId === 'free') {
      navigate('/auth');
      return;
    }

    setLoading(planId);
    
    // TODO: Integrate with Stripe checkout
    console.log('Selecting plan:', planId);
    
    setLoading(null);
  };

  const getCurrentPlanId = () => {
    if (!isSubscribed) return 'free';
    return subscriptionPlan || 'free';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                Escolha seu plano
              </h1>
              <p className="text-muted-foreground">
                Selecione o plano ideal para suas necessidades financeiras
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = getCurrentPlanId() === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'ring-2 ring-primary shadow-primary' 
                    : isCurrentPlan 
                      ? 'ring-2 ring-secondary' 
                      : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                
                {isCurrentPlan && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-3 right-4 bg-gradient-secondary text-white"
                  >
                    Plano Atual
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-primary">
                      {plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.period}
                    </div>
                  </div>
                  <CardDescription className="text-center">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations for free plan */}
                  {plan.limitations && (
                    <div className="space-y-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground">
                        Limitações:
                      </p>
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-start gap-3">
                          <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mx-auto mt-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    variant={plan.variant}
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan}
                  >
                    {loading === plan.id ? (
                      'Processando...'
                    ) : isCurrentPlan ? (
                      'Plano Ativo'
                    ) : (
                      plan.cta
                    )}
                  </Button>

                  {/* Plan Icons */}
                  <div className="flex justify-center">
                    {plan.id === 'free' && <Zap className="w-5 h-5 text-muted-foreground" />}
                    {plan.id === 'premium' && <Crown className="w-5 h-5 text-primary" />}
                    {plan.id === 'family' && <Users className="w-5 h-5 text-secondary" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Perguntas Frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">Os dados ficam salvos após o cancelamento?</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados ficam disponíveis por 30 dias após o cancelamento para reativação.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">Posso trocar de plano?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold mb-2">Como funciona o período de teste?</h3>
              <p className="text-sm text-muted-foreground">
                7 dias grátis com acesso completo às funcionalidades. Cancele antes do vencimento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;