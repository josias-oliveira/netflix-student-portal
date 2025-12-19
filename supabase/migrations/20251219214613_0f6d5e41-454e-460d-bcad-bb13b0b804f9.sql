-- Fix thumbnail URLs for Product Design courses
UPDATE public.courses 
SET thumbnail_url = '/images/curso-product-design-2.jpg'
WHERE title = 'Curso Product Design 2.0';

UPDATE public.courses 
SET thumbnail_url = '/images/curso-product-design-4.jpg'
WHERE title = 'Curso Product Design 4.0';