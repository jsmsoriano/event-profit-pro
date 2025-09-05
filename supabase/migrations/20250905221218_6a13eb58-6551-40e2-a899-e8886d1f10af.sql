-- Create user roles enum with all required roles
CREATE TYPE public.user_role AS ENUM ('owner', 'manager', 'staff', 'accountant', 'client');

-- Update profiles table to use the new role enum
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD COLUMN new_role user_role DEFAULT 'client';

-- Update existing data
UPDATE public.profiles SET new_role = 'owner' WHERE role = 'admin';
UPDATE public.profiles SET new_role = 'client' WHERE role = 'customer';

-- Drop old role column and rename new one
ALTER TABLE public.profiles DROP COLUMN role;
ALTER TABLE public.profiles RENAME COLUMN new_role TO role;

-- Create user_roles table for multiple roles per user
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role, organization_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update events table to include status and better structure
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id),
ADD COLUMN IF NOT EXISTS profit_margin NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS food_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0;

-- Update events status to include more states
ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE public.events 
ADD CONSTRAINT events_status_check 
CHECK (status IN ('inquiry', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- Create event_menu_items table to track what's ordered for each event
CREATE TABLE public.event_menu_items (
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
ALTER TABLE public.event_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage event menu items for their events" ON public.event_menu_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_menu_items.event_id 
    AND events.user_id = auth.uid()
  )
);

-- Update invoices table structure
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'Net 30';

-- Create payments table if it doesn't exist with proper structure
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
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage invoice payments" ON public.invoice_payments
FOR ALL USING (true);

-- Create profit calculation view
CREATE OR REPLACE VIEW public.v_event_profit AS
SELECT 
    e.id as event_id,
    e.title,
    e.event_date,
    e.number_of_guests as guest_count,
    e.status,
    e.total_revenue,
    e.food_cost,
    e.labor_cost,
    (e.total_revenue - COALESCE(e.food_cost, 0) - COALESCE(e.labor_cost, 0)) as gross_profit,
    CASE 
        WHEN e.total_revenue > 0 THEN 
            ((e.total_revenue - COALESCE(e.food_cost, 0) - COALESCE(e.labor_cost, 0)) / e.total_revenue * 100)
        ELSE 0 
    END as profit_margin_percent
FROM public.events e
WHERE e.status IN ('confirmed', 'in_progress', 'completed');

-- Create popular dishes view
CREATE OR REPLACE VIEW public.v_popular_dishes AS
SELECT 
    d.id as dish_id,
    d.name,
    d.category,
    COUNT(emi.id) as times_selected,
    SUM(emi.quantity) as total_quantity_ordered,
    AVG(emi.per_guest_price) as avg_price
FROM public.dishes d
LEFT JOIN public.event_menu_items emi ON d.id = emi.dish_id
LEFT JOIN public.events e ON emi.event_id = e.id
WHERE e.event_date >= CURRENT_DATE - INTERVAL '180 days'
   OR e.event_date IS NULL
GROUP BY d.id, d.name, d.category
ORDER BY times_selected DESC, total_quantity_ordered DESC;

-- Create staff table updates for flat fees and shifts
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS default_flat_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS can_work_shifts BOOLEAN DEFAULT true;

-- Update staff_assignments to handle both flat fees and hourly
ALTER TABLE public.staff_assignments
ADD COLUMN IF NOT EXISTS flat_fee NUMERIC,
ADD COLUMN IF NOT EXISTS is_flat_fee BOOLEAN DEFAULT false;

-- Create triggers to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON public.invoices 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();