import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  value: number;
  category?: string;
  purchase_date?: string;
  depreciation_rate?: number;
  current_value?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAssetData {
  name: string;
  description?: string;
  value: number;
  category?: string;
  purchase_date?: string;
  depreciation_rate?: number;
  current_value?: number;
}

export const useAssets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Erro ao carregar ativos",
        description: "Não foi possível carregar os ativos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (data: CreateAssetData): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          user_id: user.id,
          ...data,
          current_value: data.current_value || data.value,
        });

      if (error) throw error;

      toast({
        title: "Ativo criado com sucesso!",
        description: `${data.name} foi adicionado aos seus ativos.`,
      });

      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: "Erro ao criar ativo",
        description: "Não foi possível salvar o ativo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async (id: string, data: Partial<CreateAssetData>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assets')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Ativo atualizado!",
        description: "O ativo foi atualizado com sucesso.",
      });

      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error updating asset:', error);
      toast({
        title: "Erro ao atualizar ativo",
        description: "Não foi possível atualizar o ativo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Ativo excluído",
        description: "O ativo foi removido com sucesso.",
      });

      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Erro ao excluir ativo",
        description: "Não foi possível excluir o ativo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  // Real-time listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('assets-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAssets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    assets,
    loading,
    createAsset,
    updateAsset,
    deleteAsset,
    refreshAssets: fetchAssets,
  };
};