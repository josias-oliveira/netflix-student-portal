-- Adicionar role de admin ao usuário josiasoliveiraux@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('4eaffc23-ad43-4417-9c82-86c89da29903', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;