-- Create table to store learned transaction patterns
CREATE TABLE IF NOT EXISTS public.transaction_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('category', 'description', 'recurring', 'duplicate')),
  pattern_key TEXT NOT NULL,
  pattern_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_transaction_patterns_user_type ON public.transaction_patterns(user_id, pattern_type);
CREATE INDEX idx_transaction_patterns_key ON public.transaction_patterns(pattern_key);

-- Enable RLS
ALTER TABLE public.transaction_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own patterns"
  ON public.transaction_patterns
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own patterns"
  ON public.transaction_patterns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own patterns"
  ON public.transaction_patterns
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own patterns"
  ON public.transaction_patterns
  FOR DELETE
  USING (user_id = auth.uid());

-- Create table for suggested categorizations waiting for user review
CREATE TABLE IF NOT EXISTS public.transaction_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('category', 'duplicate', 'recurring', 'split')),
  original_value TEXT,
  suggested_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ignored')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_transaction_suggestions_user_status ON public.transaction_suggestions(user_id, status);
CREATE INDEX idx_transaction_suggestions_transaction ON public.transaction_suggestions(transaction_id);

-- Enable RLS
ALTER TABLE public.transaction_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own suggestions"
  ON public.transaction_suggestions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own suggestions"
  ON public.transaction_suggestions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own suggestions"
  ON public.transaction_suggestions
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own suggestions"
  ON public.transaction_suggestions
  FOR DELETE
  USING (user_id = auth.uid());

-- Add trigger to update updated_at on transaction_patterns
CREATE TRIGGER update_transaction_patterns_updated_at
  BEFORE UPDATE ON public.transaction_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add metadata columns to transactions table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'is_recurring') THEN
    ALTER TABLE public.transactions ADD COLUMN is_recurring BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'recurrence_pattern') THEN
    ALTER TABLE public.transactions ADD COLUMN recurrence_pattern TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'auto_categorized') THEN
    ALTER TABLE public.transactions ADD COLUMN auto_categorized BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'metadata') THEN
    ALTER TABLE public.transactions ADD COLUMN metadata JSONB;
  END IF;
END $$;