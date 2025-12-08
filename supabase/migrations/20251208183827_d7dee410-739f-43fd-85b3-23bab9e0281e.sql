
-- Curso 2: Marketing Digital
INSERT INTO courses (id, title, slug, description, thumbnail_url, category, instructor_name, instructor_avatar, duration_hours, is_published, is_featured)
VALUES (
  'b2b2b2b2-1111-2222-3333-b2b2b2b2b2b2',
  'Marketing Digital para Iniciantes',
  'marketing-digital-iniciantes',
  'Aprenda as estratégias essenciais de marketing digital para alavancar seu negócio online.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
  'Marketing',
  'Ana Paula Costa',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  8,
  true,
  true
);

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
('b2b21111-1111-1111-1111-111111111111', 'b2b2b2b2-1111-2222-3333-b2b2b2b2b2b2', 'Fundamentos do Marketing Digital', 'Conceitos básicos e estratégias iniciais', 0),
('b2b22222-2222-2222-2222-222222222222', 'b2b2b2b2-1111-2222-3333-b2b2b2b2b2b2', 'Redes Sociais', 'Estratégias para Facebook, Instagram e LinkedIn', 1),
('b2b23333-3333-3333-3333-333333333333', 'b2b2b2b2-1111-2222-3333-b2b2b2b2b2b2', 'Google Ads e SEO', 'Tráfego pago e orgânico', 2);

INSERT INTO lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('b2b21111-1111-1111-1111-111111111111', 'O que é Marketing Digital?', 'Introdução ao mundo do marketing online', 15, 0, true),
('b2b21111-1111-1111-1111-111111111111', 'Funil de Vendas', 'Como criar um funil eficiente', 20, 1, false),
('b2b21111-1111-1111-1111-111111111111', 'Público-Alvo e Persona', 'Definindo seu cliente ideal', 18, 2, false),
('b2b22222-2222-2222-2222-222222222222', 'Instagram para Negócios', 'Estratégias para crescer no Instagram', 25, 0, false),
('b2b22222-2222-2222-2222-222222222222', 'Facebook Ads Básico', 'Criando suas primeiras campanhas', 30, 1, false),
('b2b22222-2222-2222-2222-222222222222', 'LinkedIn para B2B', 'Vendas corporativas na rede profissional', 22, 2, false),
('b2b23333-3333-3333-3333-333333333333', 'Introdução ao SEO', 'Otimização para buscadores', 20, 0, false),
('b2b23333-3333-3333-3333-333333333333', 'Google Ads Passo a Passo', 'Configurando campanhas no Google', 35, 1, false);

-- Curso 3: Excel Avançado
INSERT INTO courses (id, title, slug, description, thumbnail_url, category, instructor_name, instructor_avatar, duration_hours, is_published, is_featured)
VALUES (
  'c3c3c3c3-1111-2222-3333-c3c3c3c3c3c3',
  'Excel Avançado para Profissionais',
  'excel-avancado-profissionais',
  'Domine fórmulas complexas, tabelas dinâmicas e dashboards profissionais no Excel.',
  'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=400&h=225&fit=crop',
  'Produtividade',
  'Ricardo Mendes',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  12,
  true,
  false
);

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
('c3c31111-1111-1111-1111-111111111111', 'c3c3c3c3-1111-2222-3333-c3c3c3c3c3c3', 'Fórmulas Avançadas', 'PROCV, ÍNDICE, CORRESP e mais', 0),
('c3c32222-2222-2222-2222-222222222222', 'c3c3c3c3-1111-2222-3333-c3c3c3c3c3c3', 'Tabelas Dinâmicas', 'Análise de dados poderosa', 1),
('c3c33333-3333-3333-3333-333333333333', 'c3c3c3c3-1111-2222-3333-c3c3c3c3c3c3', 'Dashboards e Gráficos', 'Visualização profissional de dados', 2);

INSERT INTO lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('c3c31111-1111-1111-1111-111111111111', 'PROCV e PROCH Dominados', 'Buscas verticais e horizontais', 25, 0, true),
('c3c31111-1111-1111-1111-111111111111', 'ÍNDICE + CORRESP', 'A dupla mais poderosa do Excel', 30, 1, false),
('c3c31111-1111-1111-1111-111111111111', 'Fórmulas Matriciais', 'Cálculos com arrays', 28, 2, false),
('c3c32222-2222-2222-2222-222222222222', 'Criando Tabelas Dinâmicas', 'Do básico ao avançado', 35, 0, false),
('c3c32222-2222-2222-2222-222222222222', 'Segmentação de Dados', 'Filtros visuais interativos', 20, 1, false),
('c3c33333-3333-3333-3333-333333333333', 'Gráficos Profissionais', 'Design de gráficos impactantes', 25, 0, false),
('c3c33333-3333-3333-3333-333333333333', 'Dashboard Executivo', 'Criando painéis de controle', 40, 1, false);

-- Curso 4: Liderança e Gestão
INSERT INTO courses (id, title, slug, description, thumbnail_url, category, instructor_name, instructor_avatar, duration_hours, is_published, is_featured)
VALUES (
  'd4d4d4d4-1111-2222-3333-d4d4d4d4d4d4',
  'Liderança e Gestão de Equipes',
  'lideranca-gestao-equipes',
  'Desenvolva habilidades de liderança e aprenda a motivar e gerenciar times de alta performance.',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop',
  'Gestão',
  'Fernanda Lima',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
  10,
  true,
  true
);

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
('d4d41111-1111-1111-1111-111111111111', 'd4d4d4d4-1111-2222-3333-d4d4d4d4d4d4', 'Fundamentos da Liderança', 'O que faz um grande líder', 0),
('d4d42222-2222-2222-2222-222222222222', 'd4d4d4d4-1111-2222-3333-d4d4d4d4d4d4', 'Comunicação e Feedback', 'Como se comunicar com eficiência', 1),
('d4d43333-3333-3333-3333-333333333333', 'd4d4d4d4-1111-2222-3333-d4d4d4d4d4d4', 'Gestão de Conflitos', 'Resolvendo problemas no time', 2);

INSERT INTO lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('d4d41111-1111-1111-1111-111111111111', 'Estilos de Liderança', 'Descubra seu perfil de líder', 20, 0, true),
('d4d41111-1111-1111-1111-111111111111', 'Inteligência Emocional', 'Gerenciando emoções no trabalho', 25, 1, false),
('d4d41111-1111-1111-1111-111111111111', 'Delegação Eficiente', 'Como delegar sem perder controle', 18, 2, false),
('d4d42222-2222-2222-2222-222222222222', 'Comunicação Assertiva', 'Falando com clareza e respeito', 22, 0, false),
('d4d42222-2222-2222-2222-222222222222', 'Feedback Construtivo', 'Técnicas para dar e receber feedback', 28, 1, false),
('d4d43333-3333-3333-3333-333333333333', 'Mediação de Conflitos', 'Resolvendo desentendimentos', 25, 0, false),
('d4d43333-3333-3333-3333-333333333333', 'Construindo Cultura de Time', 'Criando um ambiente colaborativo', 30, 1, false);

-- Curso 5: Python para Data Science
INSERT INTO courses (id, title, slug, description, thumbnail_url, category, instructor_name, instructor_avatar, duration_hours, is_published, is_featured)
VALUES (
  'e5e5e5e5-1111-2222-3333-e5e5e5e5e5e5',
  'Python para Data Science',
  'python-data-science',
  'Aprenda Python do zero e domine análise de dados com Pandas, NumPy e visualizações.',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
  'Tecnologia',
  'Lucas Oliveira',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  15,
  true,
  false
);

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
('e5e51111-1111-1111-1111-111111111111', 'e5e5e5e5-1111-2222-3333-e5e5e5e5e5e5', 'Python Básico', 'Fundamentos da linguagem', 0),
('e5e52222-2222-2222-2222-222222222222', 'e5e5e5e5-1111-2222-3333-e5e5e5e5e5e5', 'Pandas e NumPy', 'Manipulação de dados', 1),
('e5e53333-3333-3333-3333-333333333333', 'e5e5e5e5-1111-2222-3333-e5e5e5e5e5e5', 'Visualização de Dados', 'Gráficos com Matplotlib e Seaborn', 2);

INSERT INTO lessons (module_id, title, description, duration_minutes, order_index, is_free) VALUES
('e5e51111-1111-1111-1111-111111111111', 'Instalando Python', 'Configuração do ambiente', 15, 0, true),
('e5e51111-1111-1111-1111-111111111111', 'Variáveis e Tipos de Dados', 'Fundamentos da programação', 25, 1, true),
('e5e51111-1111-1111-1111-111111111111', 'Estruturas de Controle', 'If, for, while', 30, 2, false),
('e5e51111-1111-1111-1111-111111111111', 'Funções em Python', 'Criando código reutilizável', 28, 3, false),
('e5e52222-2222-2222-2222-222222222222', 'Introdução ao Pandas', 'DataFrames e Series', 35, 0, false),
('e5e52222-2222-2222-2222-222222222222', 'Limpeza de Dados', 'Tratando valores ausentes', 30, 1, false),
('e5e52222-2222-2222-2222-222222222222', 'NumPy para Cálculos', 'Arrays e operações matemáticas', 25, 2, false),
('e5e53333-3333-3333-3333-333333333333', 'Gráficos com Matplotlib', 'Visualizações básicas', 30, 0, false),
('e5e53333-3333-3333-3333-333333333333', 'Seaborn Avançado', 'Gráficos estatísticos bonitos', 35, 1, false);
