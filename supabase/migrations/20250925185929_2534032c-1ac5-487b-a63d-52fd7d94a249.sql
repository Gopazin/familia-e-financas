-- Create default categories for new users
-- This function will create essential default categories for users who don't have any

CREATE OR REPLACE FUNCTION public.create_default_categories(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default expense categories
  INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite) VALUES
  (_user_id, 'Alimentação', '#ef4444', '🍽️', 'expense', true),
  (_user_id, 'Transporte', '#3b82f6', '🚗', 'expense', true),
  (_user_id, 'Moradia', '#8b5cf6', '🏠', 'expense', true),
  (_user_id, 'Saúde', '#10b981', '💊', 'expense', false),
  (_user_id, 'Educação', '#f59e0b', '📚', 'expense', false),
  (_user_id, 'Lazer', '#ec4899', '🎮', 'expense', true),
  (_user_id, 'Compras', '#06b6d4', '🛒', 'expense', false),
  (_user_id, 'Serviços', '#84cc16', '🔧', 'expense', false);

  -- Insert default income categories
  INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite) VALUES
  (_user_id, 'Salário', '#22c55e', '💰', 'income', true),
  (_user_id, 'Freelance', '#3b82f6', '💼', 'income', true),
  (_user_id, 'Investimentos', '#8b5cf6', '📈', 'income', false),
  (_user_id, 'Vendas', '#f59e0b', '💸', 'income', false),
  (_user_id, 'Outros', '#6b7280', '📋', 'both', false);
END;
$$;

-- Update the handle_new_user function to create default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Create default subscription (7-day trial)
  INSERT INTO public.subscriptions (user_id, status, plan, trial_end)
  VALUES (
    NEW.id,
    'trial',
    'free',
    NOW() + INTERVAL '7 days'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default categories
  PERFORM create_default_categories(NEW.id);
  
  RETURN NEW;
END;
$$;