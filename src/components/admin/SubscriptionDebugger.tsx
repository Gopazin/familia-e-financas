import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Bug,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionDebugData {
  user_id: string;
  email?: string;
  full_name?: string;
  subscription: {
    status: string;
    plan: string;
    trial_end: string | null;
    current_period_end: string | null;
    stripe_customer_id: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  computed_access: {
    is_subscribed: boolean;
    reason: string;
    details: string[];
  };
}

const SubscriptionDebugger = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [debugData, setDebugData] = useState<SubscriptionDebugData | null>(null);
  const [allUsers, setAllUsers] = useState<SubscriptionDebugData[]>([]);
  const [showAll, setShowAll] = useState(false);

  const computeAccess = (subscription: any) => {
    if (!subscription) {
      return {
        is_subscribed: false,
        reason: 'Nenhuma assinatura encontrada',
        details: ['Usuário não possui registro na tabela subscriptions']
      };
    }

    const now = new Date();
    const details: string[] = [];
    let is_subscribed = false;
    let reason = '';

    details.push(`Status atual: ${subscription.status}`);
    details.push(`Plano atual: ${subscription.plan}`);

    if (subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      details.push(`Trial até: ${format(trialEnd, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      details.push(`Trial ${trialEnd > now ? 'válido' : 'expirado'}`);
    }

    if (subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      details.push(`Período até: ${format(periodEnd, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`);
      details.push(`Período ${periodEnd > now ? 'válido' : 'expirado'}`);
    }

    // Lógica do AuthContext
    if (subscription.status === 'active') {
      is_subscribed = true;
      reason = 'Status "active"';
    } else if (subscription.status === 'trial' && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      if (trialEnd > now) {
        is_subscribed = true;
        reason = 'Trial válido';
      } else {
        reason = 'Trial expirado';
      }
    } else if (subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      if (periodEnd > now) {
        is_subscribed = true;
        reason = 'Período ativo válido';
      } else {
        reason = 'Período expirado';
      }
    } else {
      reason = `Status "${subscription.status}" sem período válido`;
    }

    return { is_subscribed, reason, details };
  };

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email para buscar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar o usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .eq('email', searchEmail.trim())
        .single();

      if (profileError) {
        toast({
          title: "Usuário não encontrado",
          description: "Nenhum usuário encontrado com este email",
          variant: "destructive"
        });
        setDebugData(null);
        return;
      }

      // Buscar assinatura
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      const computed_access = computeAccess(subscription);

      setDebugData({
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        subscription,
        computed_access
      });

    } catch (error) {
      console.error('Error searching user:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      // Buscar todos os usuários com suas assinaturas
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .order('created_at', { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*');

      const usersData: SubscriptionDebugData[] = profiles.map(profile => {
        const subscription = subscriptions?.find(sub => sub.user_id === profile.user_id);
        const computed_access = computeAccess(subscription);

        return {
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          subscription,
          computed_access
        };
      });

      setAllUsers(usersData);
    } catch (error) {
      console.error('Error loading all users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderUserDebugCard = (userData: SubscriptionDebugData) => (
    <Card key={userData.user_id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              {userData.full_name || userData.email}
            </CardTitle>
            <CardDescription className="text-xs">
              {userData.email} • ID: {userData.user_id.slice(0, 8)}...
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {userData.computed_access.is_subscribed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <Badge variant={userData.computed_access.is_subscribed ? 'default' : 'destructive'}>
              {userData.computed_access.is_subscribed ? 'ACESSO' : 'SEM ACESSO'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            <strong>Resultado:</strong> {userData.computed_access.reason}
          </AlertDescription>
        </Alert>

        {userData.subscription ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Status:</strong> 
              <Badge variant="outline" className="ml-2">
                {userData.subscription.status}
              </Badge>
            </div>
            <div>
              <strong>Plano:</strong> 
              <Badge variant="outline" className="ml-2">
                {userData.subscription.plan}
              </Badge>
            </div>
            {userData.subscription.trial_end && (
              <div>
                <strong>Trial até:</strong>
                <br />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(userData.subscription.trial_end), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
            {userData.subscription.current_period_end && (
              <div>
                <strong>Período até:</strong>
                <br />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(userData.subscription.current_period_end), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Nenhum registro encontrado na tabela subscriptions
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-3 rounded text-xs">
          <strong>Detalhes da verificação:</strong>
          <ul className="mt-1 space-y-1">
            {userData.computed_access.details.map((detail, index) => (
              <li key={index}>• {detail}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug de Assinaturas
          </CardTitle>
          <CardDescription>
            Ferramenta para debugar problemas de acesso e assinaturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" value={showAll ? "all" : "search"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" onClick={() => setShowAll(false)}>
                Buscar Usuário
              </TabsTrigger>
              <TabsTrigger value="all" onClick={() => setShowAll(true)}>
                Todos os Usuários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email">Email do usuário</Label>
                  <Input
                    id="email"
                    placeholder="Digite o email do usuário..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={searchUser} disabled={loading}>
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {debugData && renderUserDebugCard(debugData)}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Mostrando últimos 50 usuários cadastrados
                </p>
                <Button onClick={loadAllUsers} disabled={loading} variant="outline">
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Carregar
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {allUsers.map(userData => renderUserDebugCard(userData))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionDebugger;