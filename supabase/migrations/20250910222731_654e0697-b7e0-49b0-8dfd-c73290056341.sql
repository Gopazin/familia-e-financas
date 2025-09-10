-- Add admin role to the first user (for demo purposes)
-- You can change this email to your actual admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id, role) DO NOTHING;