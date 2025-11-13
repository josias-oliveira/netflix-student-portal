-- 1. Criar enum para roles
create type public.app_role as enum ('aluno', 'admin');

-- 2. Criar tabela user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
alter table public.user_roles enable row level security;

-- 4. Criar função has_role com SECURITY DEFINER
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- 5. Migrar dados existentes de profiles.role para user_roles
insert into public.user_roles (user_id, role)
select id, role::public.app_role
from public.profiles
where role is not null
on conflict (user_id, role) do nothing;

-- 6. Remover coluna role da tabela profiles
alter table public.profiles drop column if exists role;

-- 7. Criar função e trigger para criar perfil automaticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Criar perfil
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Atribuir role padrão 'aluno'
  insert into public.user_roles (user_id, role)
  values (new.id, 'aluno');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Políticas RLS para user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- 9. Políticas RLS para profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.has_role(auth.uid(), 'admin'));

-- 10. Políticas RLS para courses
create policy "Authenticated users can view published courses"
  on public.courses for select
  using (
    auth.uid() is not null 
    and (status = 'published' or public.has_role(auth.uid(), 'admin'))
  );

create policy "Admins can manage courses"
  on public.courses for all
  using (public.has_role(auth.uid(), 'admin'));

-- 11. Políticas RLS para modules
create policy "Authenticated users can view modules of accessible courses"
  on public.modules for select
  using (
    auth.uid() is not null 
    and exists (
      select 1 from public.courses c
      where c.id = modules.course_id
      and (c.status = 'published' or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "Admins can manage modules"
  on public.modules for all
  using (public.has_role(auth.uid(), 'admin'));

-- 12. Políticas RLS para lessons
create policy "Authenticated users can view lessons of accessible modules"
  on public.lessons for select
  using (
    auth.uid() is not null 
    and exists (
      select 1 
      from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id
      and (c.status = 'published' or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "Admins can manage lessons"
  on public.lessons for all
  using (public.has_role(auth.uid(), 'admin'));

-- 13. Políticas RLS para lesson_progress
create policy "Users can view their own progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

create policy "Admins can view all progress"
  on public.lesson_progress for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete progress"
  on public.lesson_progress for delete
  using (public.has_role(auth.uid(), 'admin'));

-- 14. Políticas RLS para certificates
create policy "Users can view their own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "Public can validate certificates by code"
  on public.certificates for select
  using (validation_code is not null);

create policy "System can insert certificates"
  on public.certificates for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all certificates"
  on public.certificates for all
  using (public.has_role(auth.uid(), 'admin'));

-- 15. Políticas RLS para plans
create policy "Authenticated users can view plans"
  on public.plans for select
  using (auth.uid() is not null);

create policy "Admins can manage plans"
  on public.plans for all
  using (public.has_role(auth.uid(), 'admin'));

-- 16. Políticas RLS para subscriptions
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage all subscriptions"
  on public.subscriptions for all
  using (public.has_role(auth.uid(), 'admin'));