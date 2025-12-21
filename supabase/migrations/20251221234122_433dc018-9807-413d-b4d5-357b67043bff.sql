-- Create comment_status enum
CREATE TYPE public.comment_status AS ENUM ('pending', 'approved', 'rejected');

-- Create lesson_comments table
CREATE TABLE public.lesson_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status public.comment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view approved comments from anyone
CREATE POLICY "Anyone can view approved comments"
ON public.lesson_comments
FOR SELECT
USING (status = 'approved');

-- Users can view their own comments (any status)
CREATE POLICY "Users can view their own comments"
ON public.lesson_comments
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
ON public.lesson_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending comments
CREATE POLICY "Users can update their own pending comments"
ON public.lesson_comments
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.lesson_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all comments
CREATE POLICY "Admins can manage all comments"
ON public.lesson_comments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_lesson_comments_updated_at
BEFORE UPDATE ON public.lesson_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();