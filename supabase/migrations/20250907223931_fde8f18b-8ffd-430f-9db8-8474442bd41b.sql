-- Create missing tables and add necessary RLS policies

-- Ensure month_end_periods table exists
CREATE TABLE IF NOT EXISTS public.month_end_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL,
  status text NOT NULL DEFAULT 'open',
  closed_at timestamp with time zone,
  closed_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(year, month)
);

ALTER TABLE public.month_end_periods ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for month_end_periods
CREATE POLICY "Admin users can manage periods" ON public.month_end_periods
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);