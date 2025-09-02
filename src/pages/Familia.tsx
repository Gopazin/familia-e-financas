import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Settings,
  Crown,
  Shield,
  Eye,
  TrendingUp,
  TrendingDown,
  Plus
} from "lucide-react";

const Familia = () => {
  const familyMembers = [
    {
      id: 1,
      name: "João Silva",
      role: "Pai",
      permissions: "Administrador",
      avatar: "JS",
      totalTransactions: 24,
      monthlyContribution: 5500.00,
      type: "receita"
    },
    {
      id: 2,
      name: "Maria Silva",
      role: "Mãe", 
      permissions: "Administrador",
      avatar: "MS",
      totalTransactions: 31,
      monthlyContribution: 800.00,
      type: "receita"
    },
    {
      id: 3,
      name: "Ana Silva",
      role: "Filha",
      permissions: "Usuário",
      avatar: "AS",
      totalTransactions: 8,
      monthlyContribution: 95.30,
      type: "despesa"
    },
    {
      id: 4,
      name: "Pedro Silva",
      role: "Filho",
      permissions: "Usuário",
      avatar: "PS",
      totalTransactions: 5,
      monthlyContribution: 45.50,
      type: "despesa"
    }
  ];

  const getPermissionIcon = (permission: string) => {
    return permission === "Administrador" ? Crown : Shield;
  };

  const getPermissionColor = (permission: string) => {
    return permission === "Administrador" ? "text-secondary" : "text-primary";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-prosperity bg-clip-text text-transparent">
                Gerenciar Família
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure membros da família e suas permissões
              </p>
            </div>
            <Button className="gap-2 bg-gradient-secondary hover:bg-secondary shadow-success">
              <UserPlus className="w-4 h-4" />
              Adicionar Membro
            </Button>
          </div>

          {/* Family Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-sm text-muted-foreground">Membros Ativos</p>
            </Card>
            <Card className="p-4 text-center">
              <Crown className="w-8 h-8 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">68</p>
              <p className="text-sm text-muted-foreground">Transações este Mês</p>
            </Card>
            <Card className="p-4 text-center">
              <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Transparência</p>
            </Card>
          </div>

          {/* Family Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyMembers.map((member) => {
              const PermissionIcon = getPermissionIcon(member.permissions);
              return (
                <Card key={member.id} className="p-6 hover:shadow-card transition-smooth">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-prosperity text-white text-lg font-semibold">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <PermissionIcon className={`w-4 h-4 ${getPermissionColor(member.permissions)}`} />
                          <span className="text-sm text-muted-foreground">{member.permissions}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Transações</span>
                          <span className="font-medium">{member.totalTransactions} este mês</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Contribuição</span>
                          <div className="flex items-center gap-1">
                            {member.type === "receita" ? (
                              <TrendingUp className="w-4 h-4 text-secondary" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-primary" />
                            )}
                            <span className={`font-medium ${
                              member.type === "receita" ? "text-secondary" : "text-primary"
                            }`}>
                              {member.type === "receita" ? "+" : "-"}R$ {member.monthlyContribution.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Settings className="w-4 h-4" />
                        Configurar Permissões
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Family Rules */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Regras Familiares</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-secondary-dark">1</span>
                </div>
                <div>
                  <p className="font-medium">Transparência Total</p>
                  <p className="text-sm text-muted-foreground">Todos os membros podem visualizar o histórico familiar de transações</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-dark">2</span>
                </div>
                <div>
                  <p className="font-medium">Permissões por Idade</p>
                  <p className="text-sm text-muted-foreground">Crianças têm acesso limitado, adultos têm controle administrativo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Educação Continuada</p>
                  <p className="text-sm text-muted-foreground">Incentivamos o aprendizado financeiro através de desafios e metas</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Add New Member */}
          <Card className="p-8 text-center bg-gradient-prosperity text-white">
            <div className="space-y-4">
              <Plus className="w-16 h-16 mx-auto opacity-80" />
              <h2 className="text-2xl font-bold">Expanda sua Família Financeira</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Adicione novos membros e configure suas permissões. Quanto mais pessoas participarem, 
                melhor será o controle financeiro familiar!
              </p>
              <Button variant="secondary" size="lg" className="gap-2">
                <UserPlus className="w-5 h-5" />
                Adicionar Novo Membro
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Familia;