-- Add new columns to events table if they don't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0;

-- Create event_menu_items table
CREATE TABLE IF NOT EXISTS public.event_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    dish_id UUID REFERENCES public.dishes(id),
    package_id UUID REFERENCES public.packages(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    per_guest_price NUMERIC,
    total_price NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ((dish_id IS NOT NULL) OR (package_id IS NOT NULL))
);

-- Enable RLS on event_menu_items
DO $$
BEGIN
    ALTER TABLE public.event_menu_items ENABLE ROW LEVEL SECURITY;
EXCEPTION 
    WHEN others THEN null;
END $$;

-- Create RLS policy for event_menu_items
DROP POLICY IF EXISTS "Users can manage event menu items for their events" ON public.event_menu_items;
CREATE POLICY "Users can manage event menu items for their events" ON public.event_menu_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_menu_items.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Create invoice_payments table
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on invoice_payments
DO $$
BEGIN
    ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
EXCEPTION 
    WHEN others THEN null;
END $$;

-- Create RLS policy for invoice_payments
DROP POLICY IF EXISTS "Users can manage invoice payments" ON public.invoice_payments;
CREATE POLICY "Users can manage invoice payments" ON public.invoice_payments
FOR ALL USING (true);