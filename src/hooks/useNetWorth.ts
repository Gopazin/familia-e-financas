import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NetWorthData {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
}

export const useNetWorth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNetWorth = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('calculate_net_worth', { target_user_id: user.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setNetWorth({
          total_assets: Number(data[0].total_assets) || 0,
          total_liabilities: Number(data[0].total_liabilities) || 0,
          net_worth: Number(data[0].net_worth) || 0,
        });
      } else {
        setNetWorth({
          total_assets: 0,
          total_liabilities: 0,
          net_worth: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching net worth:', error);
      toast({
        title: "Erro ao calcular patrimônio",
        description: "Não foi possível calcular o patrimônio líquido.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNetWorth();
    }
  }, [user]);

  return {
    netWorth,
    loading,
    refreshNetWorth: fetchNetWorth,
  };
};