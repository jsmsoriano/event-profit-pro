-- Create events table for storing event information and guest details
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  event_date DATE,
  address TEXT,
  event_time TIME,
  number_of_guests INTEGER DEFAULT 0,
  gratuity NUMERIC DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'booked',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table for storing individual guest information
CREATE TABLE public.event_guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT,
  type TEXT NOT NULL DEFAULT 'adult', -- 'adult' or 'child'
  proteins TEXT[] DEFAULT '{}',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can manage their own events" 
ON public.events 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policies for event_guests
CREATE POLICY "Users can manage guests for their own events" 
ON public.event_guests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_guests.event_id 
    AND events.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_guests.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_guests_updated_at
BEFORE UPDATE ON public.event_guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();