-- Add is_paid and price columns to courses table
ALTER TABLE public.courses 
ADD COLUMN is_paid boolean NOT NULL DEFAULT false,
ADD COLUMN price numeric(10,2) DEFAULT NULL;

-- Update the new Product Design courses as paid and set one as featured
UPDATE public.courses 
SET is_paid = true, price = 497.00, is_featured = true
WHERE title = 'Curso Product Design 2.0';

UPDATE public.courses 
SET is_paid = true, price = 997.00
WHERE title = 'Curso Product Design 4.0';

-- Make sure the Workshop is NOT featured
UPDATE public.courses 
SET is_featured = false
WHERE title = 'Apresentações de Alto Impacto (Storytelling)';