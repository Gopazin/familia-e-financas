-- Adicionar suporte a ativos e passivos no sistema
-- Estender a enum de tipos de transação para incluir ativos e passivos
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'asset';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'liability';

-- Criar tabela para controle de ativos
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT,
  purchase_date DATE,
  depreciation_rate NUMERIC(5,2) DEFAULT 0,
  current_value NUMERIC(12,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para controle de passivos
CREATE TABLE public.liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC(12,2) NOT NULL,
  remaining_amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) DEFAULT 0,
  due_date DATE,
  monthly_payment NUMERIC(12,2),
  category TEXT,
  creditor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para assets
CREATE POLICY "Users can view their own assets" 
ON public.assets 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assets" 
ON public.assets 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assets" 
ON public.assets 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own assets" 
ON public.assets 
FOR DELETE 
USING (user_id = auth.uid());

-- Políticas RLS para liabilities
CREATE POLICY "Users can view their own liabilities" 
ON public.liabilities 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own liabilities" 
ON public.liabilities 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own liabilities" 
ON public.liabilities 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own liabilities" 
ON public.liabilities 
FOR DELETE 
USING (user_id = auth.uid());

-- Triggers para updated_at
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_liabilities_updated_at
BEFORE UPDATE ON public.liabilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para performance
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_liabilities_user_id ON public.liabilities(user_id);
CREATE INDEX idx_liabilities_due_date ON public.liabilities(due_date);

-- Função para calcular patrimônio líquido do usuário
CREATE OR REPLACE FUNCTION public.calculate_net_worth(target_user_id UUID)
RETURNS TABLE(
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  net_worth NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(a.total_assets, 0) as total_assets,
    COALESCE(l.total_liabilities, 0) as total_liabilities,
    COALESCE(a.total_assets, 0) - COALESCE(l.total_liabilities, 0) as net_worth
  FROM (
    SELECT SUM(COALESCE(current_value, value)) as total_assets
    FROM public.assets
    WHERE user_id = target_user_id
  ) a
  CROSS JOIN (
    SELECT SUM(remaining_amount) as total_liabilities
    FROM public.liabilities
    WHERE user_id = target_user_id
  ) l;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;