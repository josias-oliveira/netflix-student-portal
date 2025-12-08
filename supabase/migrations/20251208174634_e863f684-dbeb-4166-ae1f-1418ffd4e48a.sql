-- Insert sample course
INSERT INTO public.courses (id, title, slug, description, thumbnail_url, instructor_name, duration_hours, is_published, is_featured, category)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Apresentações de Alto Impacto',
  'apresentacoes-alto-impacto',
  'Aprenda a criar apresentações profissionais que cativam sua audiência e comunicam suas ideias com clareza e impacto.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
  'Ana Silva',
  8,
  true,
  true,
  'Comunicação'
);

-- Insert modules for the course
INSERT INTO public.modules (id, course_id, title, description, order_index) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Fundamentos das Apresentações', 'Entenda os princípios básicos de uma apresentação eficaz.', 1),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Design Visual', 'Aprenda a criar slides visualmente atraentes.', 2),
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Técnicas de Oratória', 'Domine a arte de falar em público.', 3);

-- Insert lessons for Module 1
INSERT INTO public.lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('11111111-1111-1111-1111-111111111111', 'Bem-vindo ao Curso', 'Introdução ao curso e o que você vai aprender.', 5, 1, true),
('11111111-1111-1111-1111-111111111111', 'O Poder das Apresentações', 'Por que apresentações são importantes na sua carreira.', 12, 2, true),
('11111111-1111-1111-1111-111111111111', 'Estrutura de uma Apresentação', 'Como organizar suas ideias de forma lógica.', 18, 3, false);

-- Insert lessons for Module 2
INSERT INTO public.lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('22222222-2222-2222-2222-222222222222', 'Princípios de Design', 'Cores, tipografia e hierarquia visual.', 20, 1, false),
('22222222-2222-2222-2222-222222222222', 'Templates Profissionais', 'Como usar e customizar templates.', 15, 2, false),
('22222222-2222-2222-2222-222222222222', 'Imagens e Gráficos', 'Uso efetivo de elementos visuais.', 22, 3, false);

-- Insert lessons for Module 3
INSERT INTO public.lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('33333333-3333-3333-3333-333333333333', 'Linguagem Corporal', 'Postura, gestos e contato visual.', 18, 1, false),
('33333333-3333-3333-3333-333333333333', 'Controle do Nervosismo', 'Técnicas para superar o medo de falar em público.', 15, 2, false),
('33333333-3333-3333-3333-333333333333', 'Encerramento Memorável', 'Como finalizar sua apresentação com impacto.', 12, 3, false);

-- Insert sample plans
INSERT INTO public.plans (name, description, price, interval, features, is_active) VALUES
('Premium', 'Acesso completo a todos os cursos', 49.90, 'month', '["Acesso ilimitado", "Certificados", "Suporte prioritário", "Downloads offline"]', true),
('Básico', 'Acesso a cursos selecionados', 29.90, 'month', '["Acesso a 5 cursos", "Certificados"]', true);