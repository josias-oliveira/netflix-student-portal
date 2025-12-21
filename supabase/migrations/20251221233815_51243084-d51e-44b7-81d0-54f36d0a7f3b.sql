-- Create lesson_ratings table
CREATE TABLE public.lesson_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ratings"
ON public.lesson_ratings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ratings"
ON public.lesson_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.lesson_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ratings"
ON public.lesson_ratings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_lesson_ratings_updated_at
BEFORE UPDATE ON public.lesson_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();