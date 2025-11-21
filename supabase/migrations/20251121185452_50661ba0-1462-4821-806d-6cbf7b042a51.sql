-- Add payment fields to courses table
ALTER TABLE courses 
ADD COLUMN is_paid BOOLEAN DEFAULT false,
ADD COLUMN price NUMERIC(10, 2) DEFAULT 0;

-- Update RLS policies to make courses publicly viewable
DROP POLICY IF EXISTS "Users with active subscription can view published courses or ad" ON courses;

CREATE POLICY "Anyone can view published courses"
ON courses FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can view all courses"
ON courses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update modules policy to be public for published courses
DROP POLICY IF EXISTS "Users with active subscription can view modules" ON modules;

CREATE POLICY "Anyone can view modules of published courses"
ON modules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = modules.course_id 
    AND courses.status = 'published'
  )
);

CREATE POLICY "Admins can view all modules"
ON modules FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep lessons restricted to authenticated users only
DROP POLICY IF EXISTS "Users with active subscription can view lessons" ON lessons;

CREATE POLICY "Authenticated users can view lessons"
ON lessons FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all lessons"
ON lessons FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep lesson materials restricted to authenticated users
DROP POLICY IF EXISTS "Users with active subscription can view lesson materials" ON lesson_materials;

CREATE POLICY "Authenticated users can view lesson materials"
ON lesson_materials FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view all lesson materials"
ON lesson_materials FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));