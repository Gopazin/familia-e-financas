import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Calendar as CalendarIcon, Clock, DollarSign, Info } from 'lucide-react';
import { format, addDays, addMonths, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SubscriptionData {
  status: 'trial' | 'active' | 'canceled' | 'expired';
  plan: 'free' | 'premium' | 'family';
  trial_end: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

interface SubscriptionManagerProps {
  userId: string;
  userName: string;
  userEmail: string;
  currentSubscription: SubscriptionData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const SubscriptionManager = ({
  userId,
  userName,
  userEmail,
  currentSubscription,
  open,
  onOpenChange,
  onUpdate
}: SubscriptionManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [status, setStatus] = useState<string>(currentSubscription?.status || 'trial');
  const [plan, setPlan] = useState<string>(currentSubscription?.plan || 'free');
  const [trialEnd, setTrialEnd] = useState<Date | undefined>(
    currentSubscription?.trial_end ? new Date(currentSubscription.trial_end) : undefined
  );
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(
    currentSubscription?.current_period_end ? new Date(currentSubscription.current_period_end) : undefined
  );
  const [customDays, setCustomDays] = useState<string>('7');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'premium': return 'R$ 29,90/mês';
      case 'family': return 'R$ 49,90/mês';
      default: return 'Gratuito';
    }
  };

  const quickActions = [
    {
      label: '7 dias trial',
      action: () => {
        setStatus('trial');
        setPlan('free');
        setTrialEnd(addDays(new Date(), 7));
        setPeriodEnd(undefined);
      }
    },
    {
      label: '30 dias trial',
      action: () => {
        setStatus('trial');
        setPlan('free');
        setTrialEnd(addDays(new Date(), 30));
        setPeriodEnd(undefined);
      }
    },
    {
      label: 'Premium 1 mês',
      action: () => {
        setStatus('active');
        setPlan('premium');
        setTrialEnd(undefined);
        setPeriodEnd(addMonths(new Date(), 1));
      }
    },
    {
      label: 'Premium 1 ano',
      action: () => {
        setStatus('active');
        setPlan('premium');
        setTrialEnd(undefined);
        setPeriodEnd(addYears(new Date(), 1));
      }
    },
    {
      label: 'Família 1 mês',
      action: () => {
        setStatus('active');
        setPlan('family');
        setTrialEnd(undefined);
        setPeriodEnd(addMonths(new Date(), 1));
      }
    },
    {
      label: 'Cancelar',
      action: () => {
        setStatus('canceled');
        // Manter plano e datas atuais
      }
    }
  ];

  const handleCustomDaysApply = () => {
    const days = parseInt(customDays);
    if (days > 0) {
      if (status === 'trial') {
        setTrialEnd(addDays(new Date(), days));
      } else {
        setPeriodEnd(addDays(new Date(), days));
      }
    }
  };

  const validateForm = () => {
    if (status === 'trial' && !trialEnd) {
      toast({
        title: "Erro de validação",
        description: "Data de fim do trial é obrigatória para status 'trial'",
        variant: "destructive",
      });
      return false;
    }
    
    if (status === 'active' && !periodEnd) {
      toast({
        title: "Erro de validação", 
        description: "Data de fim do período é obrigatória para status 'active'",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const updateSubscription = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        status,
        plan,
      };

      if (status === 'trial') {
        updateData.trial_end = trialEnd?.toISOString();
        updateData.current_period_end = null;
      } else if (status === 'active') {
        updateData.current_period_end = periodEnd?.toISOString();
        updateData.trial_end = null;
      } else {
        // Para canceled/expired, manter datas existentes se houver
        if (currentSubscription?.trial_end) {
          updateData.trial_end = currentSubscription.trial_end;
        }
        if (currentSubscription?.current_period_end) {
          updateData.current_period_end = currentSubscription.current_period_end;
        }
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Assinatura atualizada com sucesso",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a assinatura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const previewSubscription = () => {
    const now = new Date();
    let accessValid = false;
    let accessReason = '';

    if (status === 'active') {
      accessValid = !periodEnd || periodEnd > now;
      accessReason = accessValid ? 'Assinatura ativa' : 'Período expirado';
    } else if (status === 'trial') {
      accessValid = !trialEnd || trialEnd > now;
      accessReason = accessValid ? 'Trial válido' : 'Trial expirado';
    } else {
      accessValid = false;
      accessReason = status === 'canceled' ? 'Cancelada' : 'Expirada';
    }

    return { accessValid, accessReason };
  };

  const { accessValid, accessReason } = previewSubscription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Assinatura</DialogTitle>
          <DialogDescription>
            {userName || userEmail} - Configuração completa da assinatura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview da assinatura atual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status Atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(currentSubscription?.status || 'expired')}>
                  {currentSubscription?.status || 'Sem assinatura'}
                </Badge>
                <Badge variant="outline">
                  {currentSubscription?.plan || 'free'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getPlanPrice(currentSubscription?.plan || 'free')}
                </span>
              </div>
              
              {currentSubscription?.trial_end && (
                <p className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Trial até: {format(new Date(currentSubscription.trial_end), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
              
              {currentSubscription?.current_period_end && (
                <p className="text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Período até: {format(new Date(currentSubscription.current_period_end), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              <CardDescription>Configurações pré-definidas comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Dias"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-20"
                  type="number"
                  min="1"
                />
                <Button variant="outline" size="sm" onClick={handleCustomDaysApply}>
                  Aplicar dias
                </Button>
                <span className="text-xs text-muted-foreground">
                  (trial se status=trial, senão período ativo)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Configuração Manual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Configuração Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={plan} onValueChange={setPlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="family">Família</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status === 'trial' && (
                <div className="space-y-2">
                  <Label>Data de Fim do Trial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !trialEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {trialEnd ? format(trialEnd, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={trialEnd}
                        onSelect={setTrialEnd}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {status === 'active' && (
                <div className="space-y-2">
                  <Label>Data de Fim do Período</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !periodEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {periodEnd ? format(periodEnd, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={periodEnd}
                        onSelect={setPeriodEnd}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview da nova configuração */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                Preview da Nova Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(status)}>
                    {status}
                  </Badge>
                  <Badge variant="outline">
                    {plan}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getPlanPrice(plan)}
                  </span>
                </div>
                
                <div className={`flex items-center gap-2 p-2 rounded text-sm ${
                  accessValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {accessValid ? '✅' : '❌'} {accessReason}
                </div>
                
                {status === 'trial' && trialEnd && (
                  <p className="text-xs text-muted-foreground">
                    Trial até: {format(trialEnd, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
                
                {status === 'active' && periodEnd && (
                  <p className="text-xs text-muted-foreground">
                    Período até: {format(periodEnd, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={updateSubscription} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionManager;