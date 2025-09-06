-- Add category column to dishes table
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS category text DEFAULT 'protein';