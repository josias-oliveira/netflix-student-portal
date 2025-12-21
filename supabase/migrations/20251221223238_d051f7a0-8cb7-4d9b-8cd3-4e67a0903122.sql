-- Create enrollments table to track user course enrollments
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can enroll themselves in free courses only
CREATE POLICY "Users can enroll in free courses"
  ON public.enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id AND is_paid = false AND is_published = true
    )
  );

-- Users can delete their own enrollments
CREATE POLICY "Users can delete their own enrollments"
  ON public.enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage all enrollments"
  ON public.enrollments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));