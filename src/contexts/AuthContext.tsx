import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  isSubscribed: boolean;
  subscriptionPlan: string | null;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan, trial_end, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        const now = new Date();
        const trialEnd = data.trial_end ? new Date(data.trial_end) : null;
        const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
        
        const hasActiveSubscription = 
          data.status === 'active' || 
          (data.status === 'trial' && trialEnd && trialEnd > now) ||
          (periodEnd && periodEnd > now);

        setIsSubscribed(hasActiveSubscription);
        setSubscriptionPlan(data.plan);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta!",
          });
        } else if (event === 'USER_UPDATED') {
          // Check if this is a new signup by looking for email confirmation
          if (session?.user && !session.user.email_confirmed_at) {
            console.log('New user signed up, awaiting email confirmation');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'PASSWORD_RECOVERY') {
          toast({
            title: "Link de recuperação válido",
            description: "Você pode alterar sua senha agora.",
          });
        }

        // Defer subscription check to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            refreshSubscription();
          }, 0);
        } else {
          setIsSubscribed(false);
          setSubscriptionPlan(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          refreshSubscription();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('Attempting sign in for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('SignIn error:', error);
      let errorMessage = error.message;
      
      // Melhor tratamento de erros específicos
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique seu email e clique no link de confirmação, ou use "Reenviar confirmação".';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    }
    // Não mostrar toast de sucesso aqui pois já é feito no onAuthStateChange

    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });

    if (error) {
      console.error('SignUp error:', error);
      let errorMessage = error.message;
      
      // Melhor tratamento de erros específicos
      if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login ou use "Esqueci minha senha".';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique o formato do email.';
      } else if (error.message.includes('Password should be')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta. O link é válido por 24 horas. Verifique também a pasta de spam.",
        duration: 10000,
      });
    }

    setLoading(false);
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      console.error('Resend confirmation error:', error);
      let errorMessage = error.message;
      
      if (error.message.includes('already confirmed')) {
        errorMessage = 'Este email já foi confirmado. Tente fazer login.';
      } else if (error.message.includes('too many requests')) {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
      }
      
      toast({
        title: "Erro ao reenviar confirmação",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email de confirmação reenviado!",
        description: "Verifique seu email (inclusive spam) para o novo link de confirmação.",
        duration: 8000,
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: "Erro no login com Google",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsSubscribed(false);
    setSubscriptionPlan(null);
    setLoading(false);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir sua senha. Pode estar na pasta de spam.",
        duration: 8000,
      });
    }

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
    isSubscribed,
    subscriptionPlan,
    refreshSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}