-- Update featured course: Workshop de apresentações is now the featured one
UPDATE public.courses 
SET is_featured = true
WHERE title = 'Apresentações de Alto Impacto (Storytelling)';

UPDATE public.courses 
SET is_featured = false
WHERE title = 'Curso Product Design 2.0';