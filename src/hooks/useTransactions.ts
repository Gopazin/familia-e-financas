import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string | null;
  date: string;
  family_member_id: string | null;
  created_at: string;
  updated_at: string;
  family_member?: {
    name: string;
    role: string;
  } | null;
}

export interface CreateTransactionData {
  type: TransactionType;
  description: string;
  amount: number;
  category?: string;
  date?: string;
  family_member_id?: string;
  observation?: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        family_member: null
      }));

      setTransactions(transformedData as unknown as Transaction[]);
      calculateMonthlyStats(transformedData as unknown as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar as transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = (transactionList: Transaction[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactionList.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const stats = monthlyTransactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        acc.receitas += amount;
      } else if (transaction.type === 'expense') {
        acc.despesas += amount;
      }
      return acc;
    }, {
      receitas: 0,
      despesas: 0,
      saldo: 0
    });

    stats.saldo = stats.receitas - stats.despesas;

    setMonthlyStats(stats);
  };

  // Create new transaction
  const createTransaction = async (data: CreateTransactionData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar transações.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: data.type,
          description: data.description,
          amount: data.amount,
          category: data.category || null,
          date: data.date || new Date().toISOString().split('T')[0],
          family_member_id: data.family_member_id || null,
        });

      if (error) throw error;

      toast({
        title: "Transação criada com sucesso!",
        description: `${getTransactionTypeLabel(data.type)} de R$ ${data.amount.toFixed(2)} foi adicionada.`,
      });

      // Refresh transactions list
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Erro ao criar transação",
        description: "Não foi possível salvar a transação. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, data: Partial<CreateTransactionData>): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Transação atualizada!",
        description: "A transação foi atualizada com sucesso.",
      });

      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Erro ao atualizar transação",
        description: "Não foi possível atualizar a transação.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso.",
      });

      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erro ao excluir transação",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get transaction type label
  const getTransactionTypeLabel = (type: TransactionType): string => {
    const labels = {
      income: 'Receita',
      expense: 'Despesa'
    };
    return labels[type] || type;
  };

  // Load transactions on mount and user change
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Set up real-time listener for transactions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transactions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Real-time transaction update received');
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    transactions,
    loading,
    monthlyStats,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    getTransactionTypeLabel,
  };
};