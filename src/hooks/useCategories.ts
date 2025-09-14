import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type TransactionType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  emoji: string;
  type: TransactionType;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  emoji?: string;
  type: TransactionType;
  is_favorite?: boolean;
}

export const useCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories((data || []) as Category[]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new category
  const createCategory = async (data: CreateCategoryData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar categorias.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: data.name,
          color: data.color || '#6366f1',
          emoji: data.emoji || '💰',
          type: data.type,
          is_favorite: data.is_favorite || false,
        });

      if (error) throw error;

      toast({
        title: "Categoria criada!",
        description: `A categoria "${data.name}" foi criada com sucesso.`,
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id: string, data: Partial<CreateCategoryData>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Categoria atualizada!",
        description: "A categoria foi atualizada com sucesso.",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Categoria excluída",
        description: "A categoria foi removida com sucesso.",
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id: string, currentFavorite: boolean): Promise<boolean> => {
    return updateCategory(id, { is_favorite: !currentFavorite });
  };

  // Get categories by type
  const getCategoriesByType = (type: TransactionType) => {
    return categories.filter(cat => cat.type === type || cat.type === 'both');
  };

  // Get favorite categories
  const getFavoriteCategories = () => {
    return categories.filter(cat => cat.is_favorite);
  };

  // Load categories on mount and user change
  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  // Set up real-time listener for categories
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('categories-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Real-time category update received');
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleFavorite,
    getCategoriesByType,
    getFavoriteCategories,
    refreshCategories: fetchCategories,
  };
};