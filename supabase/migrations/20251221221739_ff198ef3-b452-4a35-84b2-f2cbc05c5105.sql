-- Adicionar colunas de certificado à tabela courses
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS certificate_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_template_url text,
  ADD COLUMN IF NOT EXISTS certificate_text_x integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS certificate_text_y integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS certificate_font_size integer DEFAULT 48,
  ADD COLUMN IF NOT EXISTS certificate_font_color text DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS certificate_date_x integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS certificate_date_y integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS certificate_date_font_size integer DEFAULT 24;