import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { Family, FamilyMember, Category } from '@/types';

interface FamilyContextType {
  family: Family | null;
  familyMembers: FamilyMember[];
  categories: Category[];
  loading: boolean;
  refreshFamily: () => Promise<void>;
  refreshFamilyMembers: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.family_id) {
      Promise.all([
        refreshFamily(),
        refreshFamilyMembers(),
        refreshCategories(),
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  const refreshFamily = async () => {
    if (!profile?.family_id) return;

    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', profile.family_id)
        .single();

      if (error) {
        console.error('Error fetching family:', error);
      } else {
        setFamily(data);
      }
    } catch (error) {
      console.error('Error fetching family:', error);
    }
  };

  const refreshFamilyMembers = async () => {
    if (!profile?.family_id) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', profile.family_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
      } else {
        setFamilyMembers(data || []);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const refreshCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`family_id.eq.${profile?.family_id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const value = {
    family,
    familyMembers,
    categories,
    loading,
    refreshFamily,
    refreshFamilyMembers,
    refreshCategories,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
};