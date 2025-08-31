// Global types and interfaces for the application

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member';
  family_id: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  role: 'pai' | 'mae' | 'filho' | 'filha' | 'outro';
  user_id?: string; // Optional link to actual user account
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  icon?: string;
  color?: string;
  is_default: boolean;
  family_id?: string; // null for default categories
  created_at: string;
}

export interface Transaction {
  id: string;
  family_id: string;
  family_member_id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  category_id: string;
  date: string;
  observation?: string;
  created_at: string;
  updated_at: string;
  // Relations
  family_member?: FamilyMember;
  category?: Category;
}

export interface Family {
  id: string;
  name: string;
  admin_user_id: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export type ApiResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: string;
};

// Form types
export interface TransactionFormData {
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  category_id: string;
  family_member_id: string;
  date: string;
  observation?: string;
}

export interface FamilyMemberFormData {
  name: string;
  role: 'pai' | 'mae' | 'filho' | 'filha' | 'outro';
}

// Dashboard summary types
export interface MonthSummary {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  transactionCount: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  total: number;
  count: number;
  percentage: number;
  color?: string;
}