-- Create dynamic categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  emoji TEXT DEFAULT '💰',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_categories_user_type ON public.categories(user_id, type);
CREATE INDEX idx_categories_favorite ON public.categories(user_id, is_favorite, created_at);

-- Create default categories for existing users
INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite)
SELECT DISTINCT user_id, 'Alimentação', '#ef4444', '🍽️', 'expense', true
FROM public.transactions
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.user_id = transactions.user_id);

INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite)
SELECT DISTINCT user_id, 'Transporte', '#f97316', '🚗', 'expense', true
FROM public.transactions
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.user_id = transactions.user_id AND categories.name = 'Transporte');

INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite)
SELECT DISTINCT user_id, 'Salário', '#22c55e', '💰', 'income', true
FROM public.transactions
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.user_id = transactions.user_id AND categories.name = 'Salário');

INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite)
SELECT DISTINCT user_id, 'Lazer', '#8b5cf6', '🎮', 'expense', true
FROM public.transactions
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.user_id = transactions.user_id AND categories.name = 'Lazer');

INSERT INTO public.categories (user_id, name, color, emoji, type, is_favorite)
SELECT DISTINCT user_id, 'Investimentos', '#06b6d4', '📈', 'income', true
FROM public.transactions
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE categories.user_id = transactions.user_id AND categories.name = 'Investimentos');