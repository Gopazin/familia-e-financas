import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Sparkles, 
  Target, 
  Star, 
  BookOpen, 
  TrendingUp,
  Users,
  Gift,
  Lock
} from "lucide-react";

const Educacao = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleComingSoonFeature = (featureName: string) => {
    toast({
      title: `${featureName} em desenvolvimento`,
      description: "Esta funcionalidade estará disponível em breve. Continue usando o app!",
    });
  };
  const features = [
    {
      icon: Target,
      title: "Missões Financeiras",
      description: "Desafios semanais para toda a família aprender sobre dinheiro",
      status: "Em breve",
      color: "bg-gradient-primary"
    },
    {
      icon: BookOpen,
      title: "Biblioteca de Conhecimento",
      description: "Artigos e vídeos sobre educação financeira para todas as idades",
      status: "Em breve",
      color: "bg-gradient-secondary"
    },
    {
      icon: Star,
      title: "Sistema de Pontos",
      description: "Ganhe pontos por registrar transações e completar desafios",
      status: "Em breve",
      color: "bg-gradient-success"
    },
    {
      icon: Users,
      title: "Desafios Familiares",
      description: "Metas colaborativas para economia e gestão financeira",
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
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-prosperity flex items-center justify-center shadow-success">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
              Educação Financeira
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transforme o aprendizado sobre dinheiro em uma jornada divertida e educativa para toda a família
            </p>
          </div>

          {/* Motivational Quote */}
          <Card className="p-8 bg-gradient-prosperity text-white text-center">
            <div className="space-y-4">
              <Sparkles className="w-12 h-12 mx-auto" />
              <blockquote className="text-2xl font-medium leading-relaxed">
                "A educação financeira é o melhor investimento que uma família pode fazer. 
                Cada real poupado hoje é uma oportunidade de crescimento amanhã."
              </blockquote>
              <p className="text-white/80 text-lg">— Família Financeira Team</p>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-card transition-smooth">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="w-3 h-3" />
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Tip Preview */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-light flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-secondary-dark" />
                  </div>
                  <h3 className="font-semibold">Dica do Dia</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ensine seus filhos a diferença entre "querer" e "precisar" antes de fazer uma compra. 
                  Esta simples pergunta pode transformar hábitos de consumo!
                </p>
              </div>
            </Card>

            {/* Progress Preview */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary-dark" />
                  </div>
                  <h3 className="font-semibold">Progresso Familiar</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta mensal de economia</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="w-full bg-secondary-light rounded-full h-2">
                    <div className="bg-gradient-secondary h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rewards Preview */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Recompensas</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary" />
                    <span className="text-sm">Economizador da Semana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm">Planejador Financeiro</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="p-8 text-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Fique por Dentro das Novidades!</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Estamos trabalhando para trazer as melhores ferramentas de educação financeira. 
                  Continue usando o app e seja notificado quando novos recursos estiverem disponíveis.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/")} size="lg" className="gap-2 bg-gradient-prosperity hover:bg-secondary shadow-success">
                  <Sparkles className="w-5 h-5" />
                  Voltar ao Dashboard
                </Button>
                <Button onClick={() => navigate("/transacoes")} variant="outline" size="lg" className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  Explorar Transações
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Educacao;