-- Add missing fields to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS streaming_url TEXT;

-- Add description field to modules table
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create materials table for lesson attachments
CREATE TABLE IF NOT EXISTS lesson_materials (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on lesson_materials
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;

-- Admins can manage materials
CREATE POLICY "Admins can manage lesson materials"
ON lesson_materials
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users with active subscription can view materials
CREATE POLICY "Users with active subscription can view lesson materials"
ON lesson_materials
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  )
);