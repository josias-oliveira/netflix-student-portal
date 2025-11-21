-- Fix security warnings by setting search_path on functions
CREATE OR REPLACE FUNCTION generate_slug(title text) 
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(trim(title));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  RETURN slug;
END;
$$;

CREATE OR REPLACE FUNCTION courses_set_slug() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    
    -- Handle duplicate slugs by appending a number
    IF EXISTS (SELECT 1 FROM courses WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) THEN
      NEW.slug := NEW.slug || '-' || NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;