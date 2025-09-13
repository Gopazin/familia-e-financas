import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Bell,
  Shield,
  Mail,
  Clock,
  Database,
  Key,
  Globe,
  Save
} from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Configure parâmetros gerais da aplicação e preferências administrativas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Parâmetros básicos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="app-name">Nome da Aplicação</Label>
              <Input id="app-name" defaultValue="FinanceiroFamiliar" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Manutenção</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar modo de manutenção
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registros Públicos</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir novos registros
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure alertas e notificações automáticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email de Boas-vindas</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar automaticamente para novos usuários
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Notificar sobre tentativas suspeitas
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatórios Semanais</Label>
                <p className="text-sm text-muted-foreground">
                  Resumo semanal para administradores
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Trial & Subscription Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Assinaturas & Trial
            </CardTitle>
            <CardDescription>
              Configure períodos e regras de assinatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="trial-period">Período de Trial (dias)</Label>
              <Input id="trial-period" type="number" defaultValue="7" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premium-price">Preço Premium (R$)</Label>
              <Input id="premium-price" type="number" defaultValue="29.90" step="0.01" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family-price">Preço Família (R$)</Label>
              <Input id="family-price" type="number" defaultValue="49.90" step="0.01" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-renovação</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar renovação automática
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação 2FA</Label>
                <p className="text-sm text-muted-foreground">
                  Exigir 2FA para administradores
                </p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Timeout de Sessão (min)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-login-attempts">Máx. Tentativas de Login</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar limitação de taxa de requisições
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Integrações Externas
          </CardTitle>
          <CardDescription>
            Configure integrações com serviços externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stripe</Label>
                <Badge variant="secondary">Conectado</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Processamento de pagamentos
              </p>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Email Service</Label>
                <Badge variant="outline">Pendente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Envio de emails transacionais
              </p>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Analytics</Label>
                <Badge variant="outline">Pendente</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitoramento e métricas
              </p>
              <Button variant="outline" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;