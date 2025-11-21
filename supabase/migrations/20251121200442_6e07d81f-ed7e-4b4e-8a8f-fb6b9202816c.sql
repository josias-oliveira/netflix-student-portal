-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Create index on email for faster searches
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update the handle_new_user function to also store the email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
begin
  -- Criar perfil com email
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  
  -- Atribuir role padrão 'aluno'
  insert into public.user_roles (user_id, role)
  values (new.id, 'aluno');
  
  -- Criar subscription gratuita ativa
  insert into public.subscriptions (user_id, plan_id, status, current_period_end)
  values (new.id, 'free', 'active', now() + interval '100 years');
  
  return new;
end;
$function$;

-- Update existing profiles with emails from auth.users
-- This will be done via a temporary function that we'll execute once
CREATE OR REPLACE FUNCTION public.sync_profile_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email FROM auth.users
  LOOP
    UPDATE public.profiles 
    SET email = user_record.email 
    WHERE id = user_record.id AND email IS NULL;
  END LOOP;
END;
$function$;

-- Execute the sync function
SELECT public.sync_profile_emails();

-- Drop the temporary function
DROP FUNCTION IF EXISTS public.sync_profile_emails();