import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  PieChart, 
  Users, 
  Shield, 
  Smartphone, 
  TrendingUp,
  Check,
  Crown,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: PieChart,
      title: 'Dashboard Inteligente',
      description: 'Visualize suas finanças com gráficos e métricas em tempo real',
    },
    {
      icon: Users,
      title: 'Gestão Familiar',
      description: 'Controle compartilhado com permissões personalizadas para cada membro',
    },
    {
      icon: TrendingUp,
      title: 'Relatórios Avançados',
      description: 'Insights detalhados para tomar melhores decisões financeiras',
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Criptografia bancária e políticas rigorosas de proteção de dados',
    },
    {
      icon: Smartphone,
      title: 'Acesso Mobile',
      description: 'Gerencie suas finanças em qualquer lugar, a qualquer momento',
    },
    {
      icon: Sparkles,
      title: 'IA Integrada',
      description: 'Categorização automática e sugestões inteligentes de economia',
    },
  ];

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '7 dias',
      description: 'Perfeito para começar',
      features: [
        'Dashboard básico',
        'Até 50 transações',
        'Relatórios simples',
        'Suporte por email',
      ],
      cta: 'Começar Grátis',
      popular: false,
    },
    {
      name: 'Premium',
      price: 'R$ 29,90',
      period: 'por mês',
      description: 'Controle financeiro completo',
      features: [
        'Transações ilimitadas',
        'Relatórios em PDF',
        'IA para categorização',
        'Backup automático',
        'Suporte prioritário',
      ],
      cta: 'Escolher Premium',
      popular: true,
    },
    {
      name: 'Família',
      price: 'R$ 49,90',
      period: 'por mês',
      description: 'Ideal para famílias',
      features: [
        'Tudo do Premium',
        'Até 6 membros',
        'Permissões personalizadas',
        'Consultoria mensal',
        'Chat dedicado',
      ],
      cta: 'Escolher Família',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                Família e Finanças
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Entrar
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-gradient-primary hover:bg-primary shadow-primary">
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-prosperity text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            Novo: 7 dias grátis para novos usuários!
          </Badge>
          <h2 className="text-5xl font-bold mb-6">
            Transforme a gestão financeira da sua família
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Uma plataforma completa para controlar gastos, planejar o futuro e 
            educar toda a família sobre finanças pessoais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 shadow-xl text-lg px-8 py-3"
            >
              Começar Teste Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Tudo que você precisa em um só lugar</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas e intuitivas para revolucionar o controle financeiro da sua família
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Escolha o plano ideal para sua família</h3>
            <p className="text-xl text-muted-foreground">
              Comece grátis e evolua conforme suas necessidades
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular ? 'ring-2 ring-primary shadow-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-primary mb-1">
                      {plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {plan.period}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/auth')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para transformar suas finanças?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de famílias que já estão no controle do seu dinheiro
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-white text-secondary hover:bg-white/90 shadow-xl text-lg px-8 py-3"
          >
            Começar Agora - 7 Dias Grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-gradient-prosperity flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Família e Finanças</span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2025 Família e Finanças. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;