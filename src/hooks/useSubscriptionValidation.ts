import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionValidation = () => {
  const { user, subscriptionPlan, isSubscribed } = useAuth();
  const { toast } = useToast();
  const [validationLoading, setValidationLoading] = useState(false);

  const validateAccess = async (requiredPlan: 'free' | 'premium' | 'family') => {
    if (!user) return false;
    
    setValidationLoading(true);
    
    try {
      // Fetch current subscription directly from database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Erro de validação",
          description: "Não foi possível validar sua assinatura.",
          variant: "destructive",
        });
        return false;
      }

      // Check if subscription is valid
      const now = new Date();
      const isTrialValid = subscription.status === 'trial' && 
        subscription.trial_end && 
        new Date(subscription.trial_end) > now;
      
      const isActiveSubscription = subscription.status === 'active';
      
      if (!isTrialValid && !isActiveSubscription) {
        toast({
          title: "Assinatura expirada",
          description: "Sua assinatura expirou. Renove para continuar usando este recurso.",
          variant: "destructive",
        });
        return false;
      }

      // Check plan level
      const planHierarchy = { free: 0, premium: 1, family: 2 };
      const userPlanLevel = planHierarchy[subscription.plan as keyof typeof planHierarchy] || 0;
      const requiredPlanLevel = planHierarchy[requiredPlan];

      if (userPlanLevel < requiredPlanLevel) {
        toast({
          title: "Plano insuficiente",
          description: `Este recurso requer o plano ${requiredPlan}. Atualize sua assinatura.`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Subscription validation error:', error);
      return false;
    } finally {
      setValidationLoading(false);
    }
  };

  const logAccess = async (resource: string, action: string) => {
    if (!user) return;

    try {
      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_user_id: user.id,
          action: `${action}_${resource}`,
          details: {
            resource,
            action,
            timestamp: new Date().toISOString(),
            user_plan: subscriptionPlan,
            is_subscribed: isSubscribed
          }
        });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  };

  return {
    validateAccess,
    logAccess,
    validationLoading
  };
};