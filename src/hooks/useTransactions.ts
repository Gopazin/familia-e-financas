import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction, MonthSummary, CategorySummary } from '@/types';
import type { TransactionFormData } from '@/lib/validations';

export const useTransactions = () => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (limit?: number) => {
    if (!profile?.family_id) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('transactions')
        .select(`
          *,
          family_member:family_members!inner(id, name, role),
          category:categories!inner(id, name, type, color)
        `)
        .eq('family_id', profile.family_id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: TransactionFormData) => {
    if (!profile?.family_id) {
      throw new Error('Família não encontrada');
    }

    try {
      const insertData = {
        ...transactionData,
        family_id: profile.family_id,
      };

      const { data, error } = await (supabase as any)
        .from('transactions')
        .insert(insertData)
        .select(`
          *,
          family_member:family_members!inner(id, name, role),
          category:categories!inner(id, name, type, color)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Add to local state
      setTransactions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<TransactionFormData>) => {
    try {
      const { data, error } = await (supabase as any)
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          family_member:family_members!inner(id, name, role),
          category:categories!inner(id, name, type, color)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === id ? data : t)
      );
      return data;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove from local state
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const getMonthSummary = async (year: number, month: number): Promise<MonthSummary> => {
    if (!profile?.family_id) {
      throw new Error('Família não encontrada');
    }

    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('family_id', profile.family_id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        throw error;
      }

      const summary = (data || []).reduce(
        (acc, transaction) => {
          if (transaction.type === 'receita') {
            acc.totalReceitas += transaction.amount;
          } else {
            acc.totalDespesas += transaction.amount;
          }
          acc.transactionCount++;
          return acc;
        },
        { totalReceitas: 0, totalDespesas: 0, saldo: 0, transactionCount: 0 }
      );

      summary.saldo = summary.totalReceitas - summary.totalDespesas;
      return summary;
    } catch (err) {
      console.error('Error fetching month summary:', err);
      throw err;
    }
  };

  const getCategorySummary = async (type?: 'receita' | 'despesa'): Promise<CategorySummary[]> => {
    if (!profile?.family_id) {
      throw new Error('Família não encontrada');
    }

    try {
      let query = supabase
        .from('transactions')
        .select(`
          category_id,
          amount,
          category:categories!inner(name, color)
        `)
        .eq('family_id', profile.family_id);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Group by category
      const categoryMap = new Map<string, { name: string; total: number; count: number; color?: string }>();
      
      (data || []).forEach(transaction => {
        const categoryId = transaction.category_id;
        const categoryName = transaction.category?.name || 'Sem categoria';
        const categoryColor = transaction.category?.color;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            name: categoryName,
            total: 0,
            count: 0,
            color: categoryColor,
          });
        }

        const category = categoryMap.get(categoryId)!;
        category.total += transaction.amount;
        category.count++;
      });

      const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);

      return Array.from(categoryMap.entries()).map(([categoryId, category]) => ({
        category_id: categoryId,
        category_name: category.name,
        total: category.total,
        count: category.count,
        percentage: total > 0 ? (category.total / total) * 100 : 0,
        color: category.color,
      }));
    } catch (err) {
      console.error('Error fetching category summary:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (profile?.family_id) {
      fetchTransactions();
    }
  }, [profile]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthSummary,
    getCategorySummary,
  };
};