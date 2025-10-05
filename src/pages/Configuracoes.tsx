import { useState, useEffect } from "react";
import Navigation from "@/components/navigation/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Palette,
  Bell,
  Shield,
  Database,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Globe,
  Bot
} from "lucide-react";

const Configuracoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assistantName, setAssistantName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_settings')
        .select('assistant_name, family_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setAssistantName(data.assistant_name || '');
        setFamilyName(data.family_name || '');
      }
    };
    
    loadSettings();
  }, [user]);

  const handleSaveAssistantSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          assistant_name: assistantName || null,
          family_name: familyName || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "O nome do assistente foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const configSections = [
    {
      icon: Palette,
      title: "Aparência",
      description: "Personalize a interface do aplicativo",
      color: "bg-gradient-primary"
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Configure alertas e lembretes",
      color: "bg-gradient-secondary"
    },
    {
      icon: Shield,
      title: "Privacidade",
      description: "Gerencie suas configurações de segurança",
      color: "bg-gradient-success"
    },
    {
      icon: Database,
      title: "Dados",
      description: "Backup, exportação e importação",
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
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize sua experiência no Família Financeira
            </p>
          </div>

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assistant Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Assistente IA</h3>
                  <p className="text-sm text-muted-foreground">Personalize seu assistente</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="family-name">Nome da Família</Label>
                  <Input 
                    id="family-name"
                    placeholder="ex: Silva"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    O assistente será chamado de "Assistente da Família {familyName || '[Sobrenome]'}"
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assistant-name">Nome Personalizado (opcional)</Label>
                  <Input 
                    id="assistant-name"
                    placeholder="ex: Assistente Financeiro"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para usar o nome padrão baseado na família
                  </p>
                </div>

                <Button 
                  onClick={handleSaveAssistantSettings}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </Card>

            {/* Appearance Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Aparência</h3>
                  <p className="text-sm text-muted-foreground">Personalize a interface</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Português (Brasil)
                        </div>
                      </SelectItem>
                      <SelectItem value="en-US" disabled>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          English (Em breve)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Animações</Label>
                    <p className="text-sm text-muted-foreground">Ativar transições suaves</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-secondary flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Notificações</h3>
                  <p className="text-sm text-muted-foreground">Gerencie alertas</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Novas Transações</Label>
                    <p className="text-sm text-muted-foreground">Quando alguém adiciona uma transação</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Metas Atingidas</Label>
                    <p className="text-sm text-muted-foreground">Quando uma meta é alcançada</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Relatórios Mensais</Label>
                    <p className="text-sm text-muted-foreground">Resumo do mês por email</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Dicas Educacionais</Label>
                    <p className="text-sm text-muted-foreground">Conteúdo de educação financeira</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-success flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Privacidade</h3>
                  <p className="text-sm text-muted-foreground">Configurações de segurança</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Autenticação em Duas Etapas</Label>
                    <p className="text-sm text-muted-foreground">Segurança adicional</p>
                  </div>
                  <Switch />
                </div>

                <Button className="w-full">
                  Alterar Senha
                </Button>
              </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-prosperity flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gerenciar Dados</h3>
                  <p className="text-sm text-muted-foreground">Backup e exportação</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Dados
                </Button>
                
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Importar Dados
                </Button>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Zona de Perigo</p>
                    <p className="text-sm text-muted-foreground">
                      Ações irreversíveis que afetam seus dados
                    </p>
                  </div>
                  
                  <Button variant="destructive" size="sm" className="gap-2 mt-3">
                    <Trash2 className="w-4 h-4" />
                    Excluir Todos os Dados
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* About */}
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Família Financeira</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Versão 1.0.0 - MVP<br />
                Desenvolvido com ❤️ para ajudar famílias a terem controle financeiro
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="outline" size="sm">Política de Privacidade</Button>
                <Button variant="outline" size="sm">Termos de Uso</Button>
                <Button variant="outline" size="sm">Suporte</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;