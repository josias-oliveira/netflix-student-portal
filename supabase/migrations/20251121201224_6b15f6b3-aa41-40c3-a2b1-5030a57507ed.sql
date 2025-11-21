-- Remove the unused certificate_instructor_name column from courses table
-- The certificate generation uses the student's name from their profile, not an instructor name

ALTER TABLE public.courses 
DROP COLUMN IF EXISTS certificate_instructor_name;