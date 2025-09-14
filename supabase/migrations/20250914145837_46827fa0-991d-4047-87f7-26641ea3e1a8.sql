-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.calculate_net_worth(target_user_id uuid)
 RETURNS TABLE(total_assets numeric, total_liabilities numeric, net_worth numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path = public
AS $function$
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
  
  RETURN NEW;
END;
$function$;

-- Add subscription validation function
CREATE OR REPLACE FUNCTION public.validate_user_subscription(user_id uuid, required_plan text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_subscription RECORD;
  plan_levels JSONB;
BEGIN
  -- Define plan hierarchy
  plan_levels := '{"free": 0, "premium": 1, "family": 2}'::jsonb;
  
  -- Get user subscription
  SELECT * INTO user_subscription
  FROM public.subscriptions
  WHERE subscriptions.user_id = validate_user_subscription.user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check if subscription exists
  IF user_subscription IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if subscription is active
  IF user_subscription.status = 'trial' AND user_subscription.trial_end < NOW() THEN
    RETURN FALSE;
  END IF;
  
  IF user_subscription.status NOT IN ('trial', 'active') THEN
    RETURN FALSE;
  END IF;
  
  -- Check plan level
  IF (plan_levels->user_subscription.plan)::int >= (plan_levels->required_plan)::int THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;