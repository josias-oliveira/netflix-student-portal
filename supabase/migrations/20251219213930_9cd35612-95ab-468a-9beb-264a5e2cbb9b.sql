-- Insert 2 new paid courses: Product Design 2.0 and Product Design 4.0
INSERT INTO public.courses (title, description, slug, category, is_published, is_featured, duration_hours, instructor_name, thumbnail_url)
VALUES 
  (
    'Curso Product Design 2.0',
    'Aprenda os fundamentos e práticas modernas de Product Design. Domine UI/UX, pesquisa de usuários, prototipagem e design systems para criar produtos digitais de alto impacto.',
    'curso-product-design-2',
    'Design',
    true,
    false,
    12,
    'BTX Academy',
    '/src/assets/curso-product-design-2.jpg'
  ),
  (
    'Curso Product Design 4.0',
    'Curso avançado de Product Design com foco em IA, automação e tecnologias emergentes. Aprenda a projetar produtos do futuro com inteligência artificial e metodologias de ponta.',
    'curso-product-design-4',
    'Design',
    true,
    false,
    20,
    'BTX Academy',
    '/src/assets/curso-product-design-4.jpg'
  );