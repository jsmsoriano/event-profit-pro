-- Create wiki articles table
CREATE TABLE public.wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'system',
  updated_by TEXT NOT NULL DEFAULT 'system'
);

-- Create wiki categories table for better organization
CREATE TABLE public.wiki_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT 'blue',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.wiki_categories (name, description, icon, color, sort_order) VALUES
  ('Getting Started', 'Essential information for new team members', 'rocket', 'green', 1),
  ('Processes', 'Business processes and workflows', 'workflow', 'blue', 2),
  ('Policies', 'Company policies and guidelines', 'shield', 'red', 3),
  ('Tools & Resources', 'Software tools and useful resources', 'tool', 'purple', 4),
  ('Training', 'Training materials and guides', 'graduation-cap', 'orange', 5),
  ('FAQ', 'Frequently asked questions', 'help-circle', 'yellow', 6);

-- Enable Row-Level Security
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for wiki articles
CREATE POLICY "Everyone can view published articles" ON public.wiki_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can view all articles" ON public.wiki_articles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create articles" ON public.wiki_articles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update articles" ON public.wiki_articles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete articles" ON public.wiki_articles
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create policies for wiki categories
CREATE POLICY "Everyone can view categories" ON public.wiki_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.wiki_categories
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.wiki_articles WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_article_slug_trigger
  BEFORE INSERT OR UPDATE ON public.wiki_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_article_slug();

-- Create index for better search performance
CREATE INDEX idx_wiki_articles_search ON public.wiki_articles USING gin(to_tsvector('english', title || ' ' || content || ' ' || excerpt));
CREATE INDEX idx_wiki_articles_category ON public.wiki_articles(category);
CREATE INDEX idx_wiki_articles_published ON public.wiki_articles(is_published);
CREATE INDEX idx_wiki_articles_slug ON public.wiki_articles(slug);