-- Create event types table for managing different event categories
CREATE TABLE IF NOT EXISTS public.event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_price numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_types
CREATE POLICY "Users can manage their own event types" ON public.event_types
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert default event types for existing users
INSERT INTO public.event_types (user_id, organization_id, name, description, base_price)
SELECT 
  p.id,
  p.organization_id,
  'Hibachi',
  'Interactive hibachi dining experience',
  0
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_types et 
  WHERE et.user_id = p.id AND et.name = 'Hibachi'
);

INSERT INTO public.event_types (user_id, organization_id, name, description, base_price)
SELECT 
  p.id,
  p.organization_id,
  'Catering',
  'Traditional catering service',
  0
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_types et 
  WHERE et.user_id = p.id AND et.name = 'Catering'
);

-- Update events table to reference event_types
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type_id uuid REFERENCES public.event_types(id);

-- Update existing events to use default event type
UPDATE public.events 
SET event_type_id = (
  SELECT et.id 
  FROM public.event_types et 
  WHERE et.user_id = events.user_id 
  AND et.name = 'Catering' 
  LIMIT 1
)
WHERE event_type_id IS NULL;