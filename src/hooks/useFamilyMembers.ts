import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  role: string;
  avatar_url?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateFamilyMemberData {
  name: string;
  role: string;
  avatar_url?: string;
  permissions?: string[];
}

export const useFamilyMembers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch family members
  const fetchFamilyMembers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast({
        title: "Erro ao carregar membros da família",
        description: "Não foi possível carregar os membros da família.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create family member
  const createFamilyMember = async (data: CreateFamilyMemberData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para adicionar membros.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          name: data.name,
          role: data.role,
          avatar_url: data.avatar_url || null,
          permissions: data.permissions || [],
        });

      if (error) throw error;

      toast({
        title: "Membro adicionado!",
        description: `${data.name} foi adicionado à família como ${data.role}.`,
      });

      await fetchFamilyMembers();
      return true;
    } catch (error) {
      console.error('Error creating family member:', error);
      toast({
        title: "Erro ao adicionar membro",
        description: "Não foi possível adicionar o membro da família.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update family member
  const updateFamilyMember = async (id: string, data: Partial<CreateFamilyMemberData>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Membro atualizado!",
        description: "As informações do membro foram atualizadas.",
      });

      await fetchFamilyMembers();
      return true;
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: "Erro ao atualizar membro",
        description: "Não foi possível atualizar o membro.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete family member
  const deleteFamilyMember = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O membro foi removido da família.",
      });

      await fetchFamilyMembers();
      return true;
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: "Erro ao remover membro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load family members on mount and user change
  useEffect(() => {
    if (user) {
      fetchFamilyMembers();
    }
  }, [user]);

  return {
    familyMembers,
    loading,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    refreshFamilyMembers: fetchFamilyMembers,
  };
};