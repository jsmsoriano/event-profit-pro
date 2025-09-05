-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tax_rate NUMERIC DEFAULT 0.07,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dishes table
CREATE TABLE public.dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price_per_guest NUMERIC DEFAULT 0,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Packages table  
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_per_guest NUMERIC DEFAULT 0,
  min_guests INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Package Items (dishes included in packages)
CREATE TABLE public.package_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  qty_per_guest NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(package_id, dish_id)
);

-- Event Menu Items (linking events to dishes/packages)
CREATE TABLE public.event_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  per_guest_overrides JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_dish_or_package CHECK (
    (dish_id IS NOT NULL AND package_id IS NULL) OR 
    (dish_id IS NULL AND package_id IS NOT NULL)
  )
);

-- Event Staff assignments (different from existing staff_assignments)
CREATE TABLE public.event_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  flat_fee NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, staff_id)
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC GENERATED ALWAYS AS (subtotal + tax) STORED,
  issued_at TIMESTAMP WITH TIME ZONE,
  due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash', -- cash, credit, check, bank_transfer
  status TEXT DEFAULT 'completed', -- pending, completed, failed
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing events table to add required fields
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Event';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS special_requests TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS deposit_due_on DATE;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS final_count_due_on DATE;

-- Update existing clients table to add organization
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update user_roles to include organization_id  
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create audit log table
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  endpoint TEXT NOT NULL,
  payload_hash TEXT,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can manage organizations" ON public.organizations
FOR ALL USING (true);

CREATE POLICY "Users can manage organization venues" ON public.venues
FOR ALL USING (true);

CREATE POLICY "Users can manage their dishes" ON public.dishes
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their packages" ON public.packages
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage package items" ON public.package_items
FOR ALL USING (EXISTS (
  SELECT 1 FROM packages WHERE packages.id = package_items.package_id AND packages.user_id = auth.uid()
));

CREATE POLICY "Users can manage event menu items" ON public.event_menu_items
FOR ALL USING (EXISTS (
  SELECT 1 FROM events WHERE events.id = event_menu_items.event_id AND events.user_id = auth.uid()
));

CREATE POLICY "Users can manage event staff" ON public.event_staff
FOR ALL USING (EXISTS (
  SELECT 1 FROM events WHERE events.id = event_staff.event_id AND events.user_id = auth.uid()
));

CREATE POLICY "Users can manage their invoices" ON public.invoices
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage invoice payments" ON public.payments_new
FOR ALL USING (EXISTS (
  SELECT 1 FROM invoices WHERE invoices.id = payments_new.invoice_id AND invoices.user_id = auth.uid()
));

CREATE POLICY "Users can view audit log" ON public.audit_log
FOR SELECT USING (auth.uid() = user_id);

-- Create views for analytics
CREATE OR REPLACE VIEW public.v_event_profit AS
SELECT 
  e.id as event_id,
  e.title,
  e.event_date,
  e.status,
  e.number_of_guests as guest_count,
  COALESCE(i.subtotal, 0) as revenue_menu,
  COALESCE(labor.labor_cost, 0) as labor_cost,
  COALESCE(food.food_cost, 0) as food_cost,
  COALESCE(i.subtotal, 0) as subtotal_revenue,
  COALESCE(i.subtotal, 0) - COALESCE(labor.labor_cost, 0) - COALESCE(food.food_cost, 0) as gross_profit
FROM public.events e
LEFT JOIN public.invoices i ON e.id = i.event_id
LEFT JOIN (
  SELECT 
    es.event_id,
    SUM(
      CASE 
        WHEN es.flat_fee IS NOT NULL THEN es.flat_fee
        WHEN es.start_time IS NOT NULL AND es.end_time IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (es.end_time - es.start_time)) / 3600 * s.hourly_rate
        ELSE 0
      END
    ) as labor_cost
  FROM public.event_staff es
  JOIN public.staff s ON es.staff_id = s.id
  GROUP BY es.event_id
) labor ON e.id = labor.event_id
LEFT JOIN (
  SELECT 
    emi.event_id,
    SUM(
      CASE 
        WHEN emi.dish_id IS NOT NULL THEN 0 -- Simplified for MVP
        WHEN emi.package_id IS NOT NULL THEN 0 -- Simplified for MVP  
        ELSE 0
      END
    ) as food_cost
  FROM public.event_menu_items emi
  GROUP BY emi.event_id
) food ON e.id = food.event_id;

CREATE OR REPLACE VIEW public.v_popular_dishes AS
SELECT 
  d.id as dish_id,
  d.name,
  COUNT(emi.id) as times_selected
FROM public.dishes d
LEFT JOIN public.event_menu_items emi ON d.id = emi.dish_id
WHERE d.is_active = true
GROUP BY d.id, d.name
ORDER BY times_selected DESC;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
BEFORE UPDATE ON public.dishes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();