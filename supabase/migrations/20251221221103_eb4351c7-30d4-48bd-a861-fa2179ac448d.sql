-- Adicionar coluna email à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Atualizar o trigger para incluir email ao criar novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'aluno');
  
  RETURN new;
END;
$function$;

-- Atualizar emails de usuários existentes
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;