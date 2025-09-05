-- Create user role enum if it doesn't exist
DO $$ 
BEGIN 
    CREATE TYPE public.user_role AS ENUM ('owner', 'manager', 'staff', 'accountant', 'client');
EXCEPTION 
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to events table if they don't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0;

-- Update events status constraint
ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE public.events 
ADD CONSTRAINT events_status_check 
CHECK (status IN ('inquiry', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled'));

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

-- Enable RLS on event_menu_items if table was just created
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

-- Add columns to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';

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

-- Add columns to staff table
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS default_flat_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_work_shifts BOOLEAN DEFAULT true;

-- Add columns to staff_assignments
ALTER TABLE public.staff_assignments
ADD COLUMN IF NOT EXISTS flat_fee NUMERIC,
ADD COLUMN IF NOT EXISTS is_flat_fee BOOLEAN DEFAULT false;

-- Create profit calculation view
CREATE OR REPLACE VIEW public.v_event_profit AS
SELECT 
    e.id as event_id,
    e.title,
    e.event_date,
    e.number_of_guests as guest_count,
    e.status,
    COALESCE(e.total_revenue, 0) as revenue_menu,
    COALESCE(e.food_cost, 0) as food_cost,
    COALESCE(e.labor_cost, 0) as labor_cost,
    (COALESCE(e.total_revenue, 0) - COALESCE(e.food_cost, 0) - COALESCE(e.labor_cost, 0)) as gross_profit,
    CASE 
        WHEN COALESCE(e.total_revenue, 0) > 0 THEN 
            ((COALESCE(e.total_revenue, 0) - COALESCE(e.food_cost, 0) - COALESCE(e.labor_cost, 0)) / e.total_revenue * 100)
        ELSE 0 
    END as profit_margin_percent
FROM public.events e
WHERE e.status IN ('confirmed', 'in_progress', 'completed') OR e.status IS NULL;

-- Create popular dishes view (matching the existing structure)
CREATE OR REPLACE VIEW public.v_popular_dishes AS
SELECT 
    d.id as dish_id,
    d.name,
    COUNT(emi.id) as times_selected
FROM public.dishes d
LEFT JOIN public.event_menu_items emi ON d.id = emi.dish_id
LEFT JOIN public.events e ON emi.event_id = e.id
WHERE e.event_date >= CURRENT_DATE - INTERVAL '180 days'
   OR e.event_date IS NULL
GROUP BY d.id, d.name
ORDER BY times_selected DESC;