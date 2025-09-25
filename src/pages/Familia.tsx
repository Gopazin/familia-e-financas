import { useState } from "react";
import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Settings,
  Crown,
  Shield,
  Eye,
  TrendingUp,
  TrendingDown,
  Plus,
  Mail,
  Copy
} from "lucide-react";

const Familia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { familyMembers, loading, createFamilyMember, deleteFamilyMember, updateFamilyMember } = useFamilyMembers();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    permissions: ["view_transactions"]
  });

  const getPermissionIcon = (permissions: string[]) => {
    return permissions.includes("admin") ? Crown : Shield;
  };

  const getPermissionColor = (permissions: string[]) => {
    return permissions.includes("admin") ? "text-secondary" : "text-primary";
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) {
      toast({
        title: "Erro",
        description: "Nome e função são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const success = await createFamilyMember({
      name: newMember.name,
      role: newMember.role,
      permissions: newMember.permissions
    });

    if (success) {
      setIsAddDialogOpen(false);
      setNewMember({ name: "", role: "", permissions: ["view_transactions"] });
    }
  };

  const generateInviteLink = () => {
    const inviteUrl = `${window.location.origin}/family-invite?code=${user?.id}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link copiado!",
      description: "Link de convite familiar copiado para a área de transferência"
    });
  };

  const admins = familyMembers.filter(member => member.permissions.includes("admin"));
  const totalTransactions = familyMembers.reduce((sum, member) => {
    // This would come from actual transaction data in a real implementation
    return sum + (Math.floor(Math.random() * 30) + 1);
  }, 0);

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
            <div className="flex gap-2">
              <Button onClick={generateInviteLink} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copiar Link de Convite
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-secondary hover:bg-secondary shadow-success">
                    <UserPlus className="w-4 h-4" />
                    Adicionar Membro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Membro da Família</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do membro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Função na Família</Label>
                      <Select value={newMember.role} onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pai">Pai</SelectItem>
                          <SelectItem value="Mãe">Mãe</SelectItem>
                          <SelectItem value="Filho(a)">Filho(a)</SelectItem>
                          <SelectItem value="Avô/Avó">Avô/Avó</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddMember} disabled={loading}>
                        {loading ? "Adicionando..." : "Adicionar"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Family Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{familyMembers.length}</p>
              <p className="text-sm text-muted-foreground">Membros Ativos</p>
            </Card>
            <Card className="p-4 text-center">
              <Crown className="w-8 h-8 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{admins.length}</p>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-secondary mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
              <p className="text-sm text-muted-foreground">Transações este Mês</p>
            </Card>
            <Card className="p-4 text-center">
              <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Transparência</p>
            </Card>
          </div>

          {/* Family Members */}
          {familyMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {familyMembers.map((member) => {
                const PermissionIcon = getPermissionIcon(member.permissions);
                const isAdmin = member.permissions.includes("admin");
                const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
                
                return (
                  <Card key={member.id} className="p-6 hover:shadow-card transition-smooth">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-gradient-prosperity text-white text-lg font-semibold">
                          {initials}
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
                            <span className="text-sm text-muted-foreground">
                              {isAdmin ? "Administrador" : "Usuário"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Membro desde</span>
                            <span className="font-medium text-sm">
                              {new Date(member.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Permissões</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {member.permissions.length} permissões
                              </Badge>
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
          ) : (
            <Card className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum membro adicionado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione membros da sua família para começar a gerenciar as finanças em conjunto
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Adicionar Primeiro Membro
                  </Button>
                </DialogTrigger>
              </Dialog>
            </Card>
          )}

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

          {/* Invite Section */}
          <Card className="p-8 text-center bg-gradient-prosperity text-white">
            <div className="space-y-4">
              <Mail className="w-16 h-16 mx-auto opacity-80" />
              <h2 className="text-2xl font-bold">Convide sua Família</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                Compartilhe o link de convite com seus familiares para que eles possam acessar 
                o mesmo plano familiar e gerenciar as finanças juntos!
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={generateInviteLink} variant="secondary" size="lg" className="gap-2">
                  <Copy className="w-5 h-5" />
                  Copiar Link de Convite
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <UserPlus className="w-5 h-5" />
                      Adicionar Membro
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Familia;