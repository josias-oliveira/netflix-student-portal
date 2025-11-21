-- Add slug and featured fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title text) 
RETURNS text 
LANGUAGE plpgsql
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

-- Update existing courses with slugs based on their titles
UPDATE courses 
SET slug = generate_slug(title)
WHERE slug IS NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION courses_set_slug() 
RETURNS TRIGGER 
LANGUAGE plpgsql
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

DROP TRIGGER IF EXISTS courses_set_slug_trigger ON courses;
CREATE TRIGGER courses_set_slug_trigger
BEFORE INSERT OR UPDATE OF title, slug ON courses
FOR EACH ROW
EXECUTE FUNCTION courses_set_slug();