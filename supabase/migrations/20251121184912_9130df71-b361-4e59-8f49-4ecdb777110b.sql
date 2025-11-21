-- Add certificate configuration fields to courses table
ALTER TABLE courses 
ADD COLUMN certificate_enabled BOOLEAN DEFAULT false,
ADD COLUMN certificate_template_url TEXT,
ADD COLUMN certificate_text_x INTEGER DEFAULT 50,
ADD COLUMN certificate_text_y INTEGER DEFAULT 50,
ADD COLUMN certificate_font_size INTEGER DEFAULT 48,
ADD COLUMN certificate_font_color TEXT DEFAULT '#000000',
ADD COLUMN certificate_instructor_name TEXT;

-- Update RLS policies for certificates bucket
CREATE POLICY "Admins can upload certificate templates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates' 
  AND (storage.foldername(name))[1] = 'templates'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update certificate templates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'certificates' 
  AND (storage.foldername(name))[1] = 'templates'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete certificate templates"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'certificates' 
  AND (storage.foldername(name))[1] = 'templates'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can view their certificates"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificates'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "System can insert user certificates"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificates'
  AND (storage.foldername(name))[1] IS NOT NULL
);