import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate?: number;
  due_date?: string;
  monthly_payment?: number;
  category?: string;
  creditor?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLiabilityData {
  name: string;
  description?: string;
  total_amount: number;
  remaining_amount: number;
  interest_rate?: number;
  due_date?: string;
  monthly_payment?: number;
  category?: string;
  creditor?: string;
}

export const useLiabilities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiabilities = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setLiabilities(data || []);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      toast({
        title: "Erro ao carregar passivos",
        description: "Não foi possível carregar os passivos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLiability = async (data: CreateLiabilityData): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('liabilities')
        .insert({
          user_id: user.id,
          ...data,
        });

      if (error) throw error;

      toast({
        title: "Passivo criado com sucesso!",
        description: `${data.name} foi adicionado aos seus passivos.`,
      });

      await fetchLiabilities();
      return true;
    } catch (error) {
      console.error('Error creating liability:', error);
      toast({
        title: "Erro ao criar passivo",
        description: "Não foi possível salvar o passivo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateLiability = async (id: string, data: Partial<CreateLiabilityData>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('liabilities')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Passivo atualizado!",
        description: "O passivo foi atualizado com sucesso.",
      });

      await fetchLiabilities();
      return true;
    } catch (error) {
      console.error('Error updating liability:', error);
      toast({
        title: "Erro ao atualizar passivo",
        description: "Não foi possível atualizar o passivo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteLiability = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('liabilities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Passivo excluído",
        description: "O passivo foi removido com sucesso.",
      });

      await fetchLiabilities();
      return true;
    } catch (error) {
      console.error('Error deleting liability:', error);
      toast({
        title: "Erro ao excluir passivo",
        description: "Não foi possível excluir o passivo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiabilities();
    }
  }, [user]);

  // Real-time listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('liabilities-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'liabilities',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchLiabilities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    liabilities,
    loading,
    createLiability,
    updateLiability,
    deleteLiability,
    refreshLiabilities: fetchLiabilities,
  };
};