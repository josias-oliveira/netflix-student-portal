-- Add duration field to lessons table (in minutes)
ALTER TABLE public.lessons
ADD COLUMN duration integer DEFAULT 0;

COMMENT ON COLUMN public.lessons.duration IS 'Duration of the video in minutes';