-- Promote the user gregori.pazinato@gmail.com to admin role
INSERT INTO public.user_roles (user_id, role)
SELECT profiles.user_id, 'admin'::app_role
FROM public.profiles 
WHERE profiles.email = 'gregori.pazinato@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = profiles.user_id 
  AND user_roles.role = 'admin'
);

-- Also ensure there's an admin role management function for future use
CREATE OR REPLACE FUNCTION public.get_user_roles(target_user_id uuid)
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_roles.role
  FROM public.user_roles
  WHERE user_roles.user_id = target_user_id;
$$;