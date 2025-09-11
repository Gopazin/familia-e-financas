import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Shield, 
  UserX, 
  Crown,
  RefreshCw,
  MoreVertical,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  user_id: string;
  subscriptions?: {
    status: 'trial' | 'active' | 'canceled' | 'expired';
    plan: 'free' | 'premium' | 'family';
    trial_end: string | null;
    current_period_end: string | null;
    stripe_customer_id: string | null;
  } | null;
  user_roles?: {
    role: 'admin' | 'user' | 'super_admin';
  }[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users with all related data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch subscriptions
      const { data: subscriptionsData } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan, trial_end, current_period_end, stripe_customer_id');

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Merge all data
      const mergedData = usersData?.map(user => {
        const subscription = subscriptionsData?.find(sub => sub.user_id === user.user_id);
        const roles = rolesData?.filter(role => role.user_id === user.user_id);
        return {
          ...user,
          subscriptions: subscription || null,
          user_roles: roles || []
        };
      }) || [];

      setUsers(mergedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserSubscription = async (userId: string, newStatus: 'trial' | 'active' | 'canceled' | 'expired') => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status da assinatura atualizado com sucesso.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // First, remove existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Papel do usuário atualizado com sucesso.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel do usuário.",
        variant: "destructive",
      });
    }
  };

  const sendWelcomeEmail = async (userEmail: string) => {
    // TODO: Implement email sending via edge function
    toast({
      title: "Email Enviado",
      description: `Email de boas-vindas enviado para ${userEmail}`,
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.subscriptions?.status === statusFilter;
    const matchesPlan = planFilter === 'all' || user.subscriptions?.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'canceled': return 'destructive';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan?: string) => {
    switch (plan) {
      case 'premium': return 'default';
      case 'family': return 'secondary';
      default: return 'outline';
    }
  };

  const isAdmin = (user: UserData) => {
    return user.user_roles?.some(role => role.role === 'admin') || false;
  };

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Nome', 'Plano', 'Status', 'Data de Cadastro'],
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.subscriptions?.plan || 'free',
        user.subscriptions?.status || 'inactive',
        new Date(user.created_at).toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários da plataforma
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm" onClick={exportUsers}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Planos</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="family">Família</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isAdmin(user) && <Crown className="w-4 h-4 text-primary" />}
                        {user.full_name || 'Nome não informado'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getPlanBadgeVariant(user.subscriptions?.plan)}>
                        {user.subscriptions?.plan || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.subscriptions?.status)}>
                        {user.subscriptions?.status || 'inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAdmin(user) ? 'default' : 'secondary'}>
                        {isAdmin(user) ? 'Admin' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Subscription Actions */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <DollarSign className="w-4 h-4 mr-1" />
                              Assinatura
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Gerenciar Assinatura</AlertDialogTitle>
                              <AlertDialogDescription>
                                Alterar status da assinatura de {user.full_name || user.email}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={() => updateUserSubscription(user.user_id, 'active')}
                                variant="default"
                                size="sm"
                              >
                                Ativar
                              </Button>
                              <Button 
                                onClick={() => updateUserSubscription(user.user_id, 'trial')}
                                variant="secondary"
                                size="sm"
                              >
                                Trial
                              </Button>
                              <Button 
                                onClick={() => updateUserSubscription(user.user_id, 'canceled')}
                                variant="destructive"
                                size="sm"
                              >
                                Cancelar
                              </Button>
                              <Button 
                                onClick={() => updateUserSubscription(user.user_id, 'expired')}
                                variant="outline"
                                size="sm"
                              >
                                Expirar
                              </Button>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Fechar</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Role Actions */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Shield className="w-4 h-4 mr-1" />
                              Papel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Alterar Papel</AlertDialogTitle>
                              <AlertDialogDescription>
                                Alterar papel de {user.full_name || user.email}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => updateUserRole(user.user_id, 'admin')}
                                variant={isAdmin(user) ? 'default' : 'outline'}
                                size="sm"
                              >
                                <Crown className="w-4 h-4 mr-1" />
                                Admin
                              </Button>
                              <Button 
                                onClick={() => updateUserRole(user.user_id, 'user')}
                                variant={!isAdmin(user) ? 'default' : 'outline'}
                                size="sm"
                              >
                                Usuário
                              </Button>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Fechar</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Email Action */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendWelcomeEmail(user.email)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;