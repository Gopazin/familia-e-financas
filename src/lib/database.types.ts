export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          admin_user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          admin_user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          admin_user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          name: string
          role: 'pai' | 'mae' | 'filho' | 'filha' | 'outro'
          user_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          role: 'pai' | 'mae' | 'filho' | 'filha' | 'outro'
          user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          role?: 'pai' | 'mae' | 'filho' | 'filha' | 'outro'
          user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          type: 'receita' | 'despesa'
          icon: string | null
          color: string | null
          is_default: boolean
          family_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'receita' | 'despesa'
          icon?: string | null
          color?: string | null
          is_default?: boolean
          family_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'receita' | 'despesa'
          icon?: string | null
          color?: string | null
          is_default?: boolean
          family_id?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          family_id: string
          family_member_id: string
          type: 'receita' | 'despesa'
          description: string
          amount: number
          category_id: string
          date: string
          observation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          family_member_id: string
          type: 'receita' | 'despesa'
          description: string
          amount: number
          category_id: string
          date: string
          observation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          family_member_id?: string
          type?: 'receita' | 'despesa'
          description?: string
          amount?: number
          category_id?: string
          date?: string
          observation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'member'
          family_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'admin' | 'member'
          family_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'member'
          family_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}