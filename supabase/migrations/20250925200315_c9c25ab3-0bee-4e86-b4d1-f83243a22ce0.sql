-- Add phone_number field to profiles table for WhatsApp integration
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT UNIQUE;

-- Create index for phone number lookups
CREATE INDEX idx_profiles_phone_number ON public.profiles(phone_number);

-- Create default categories for existing users who don't have any
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM public.profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.categories c 
            WHERE c.user_id = p.user_id
        )
    LOOP
        PERFORM create_default_categories(user_record.user_id);
    END LOOP;
END
$$;