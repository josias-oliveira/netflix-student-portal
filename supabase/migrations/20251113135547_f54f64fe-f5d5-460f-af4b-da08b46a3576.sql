-- Inserir plano FREE se não existir
INSERT INTO public.plans (id, name, price, stripe_price_id)
VALUES ('free', 'Plano Gratuito', 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- Atualizar trigger para criar subscription free automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  -- Criar perfil
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Atribuir role padrão 'aluno'
  insert into public.user_roles (user_id, role)
  values (new.id, 'aluno');
  
  -- Criar subscription gratuita ativa
  insert into public.subscriptions (user_id, plan_id, status, current_period_end)
  values (new.id, 'free', 'active', now() + interval '100 years');
  
  return new;
end;
$function$;

-- Atualizar políticas RLS para lessons (exige subscription ativa)
DROP POLICY IF EXISTS "Authenticated users can view lessons of accessible modules" ON public.lessons;

CREATE POLICY "Users with active subscription can view lessons"
ON public.lessons
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  )
);

-- Atualizar políticas RLS para modules (exige subscription ativa)
DROP POLICY IF EXISTS "Authenticated users can view modules of accessible courses" ON public.modules;

CREATE POLICY "Users with active subscription can view modules"
ON public.modules
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  )
);

-- Atualizar políticas RLS para courses (exige subscription ativa para ver publicados)
DROP POLICY IF EXISTS "Authenticated users can view published courses" ON public.courses;

CREATE POLICY "Users with active subscription can view published courses"
ON public.courses
FOR SELECT
USING (
  (auth.uid() IS NOT NULL 
   AND status = 'published'
   AND EXISTS (
     SELECT 1 FROM public.subscriptions s
     WHERE s.user_id = auth.uid()
     AND s.status = 'active'
     AND (s.current_period_end IS NULL OR s.current_period_end > now())
   ))
  OR has_role(auth.uid(), 'admin'::app_role)
);