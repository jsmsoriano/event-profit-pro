-- Staff Management
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff', -- chef, server, assistant, manager
  hourly_rate NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Staff Event Assignments
CREATE TABLE public.staff_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  role_for_event TEXT NOT NULL, -- head_chef, sous_chef, server, setup_crew
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  hourly_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, staff_id)
);

-- Event Milestones & Timeline
CREATE TABLE public.event_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_staff UUID REFERENCES staff(id),
  notes TEXT,
  milestone_type TEXT DEFAULT 'general', -- setup, prep, cooking, service, cleanup
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Task Management
CREATE TABLE public.event_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  assigned_staff UUID REFERENCES staff(id),
  due_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  task_category TEXT DEFAULT 'general', -- setup, cooking, service, cleanup, prep
  estimated_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory Management
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- protein, vegetable, dairy, spice, equipment
  unit_type TEXT DEFAULT 'piece', -- piece, lb, kg, gallon, liter
  current_quantity NUMERIC DEFAULT 0,
  minimum_stock NUMERIC DEFAULT 0,
  cost_per_unit NUMERIC DEFAULT 0,
  supplier_id UUID,
  storage_location TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for inventory_items supplier
ALTER TABLE public.inventory_items 
ADD CONSTRAINT fk_inventory_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id);

-- Supplier Orders
CREATE TABLE public.supplier_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, ordered, delivered, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order Line Items
CREATE TABLE public.order_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES supplier_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  received_quantity NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu Items & Recipes
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'entree', -- appetizer, entree, dessert, beverage
  base_price NUMERIC DEFAULT 0,
  cost_per_serving NUMERIC DEFAULT 0,
  prep_time INTEGER, -- in minutes
  cooking_time INTEGER, -- in minutes
  serves INTEGER DEFAULT 1,
  dietary_info TEXT[], -- vegetarian, vegan, gluten-free, etc
  is_active BOOLEAN DEFAULT true,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recipe Ingredients
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_needed NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Revenue Tracking
CREATE TABLE public.revenue_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  client_id UUID REFERENCES clients(id),
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gross_revenue NUMERIC NOT NULL DEFAULT 0,
  food_costs NUMERIC DEFAULT 0,
  labor_costs NUMERIC DEFAULT 0,
  other_expenses NUMERIC DEFAULT 0,
  net_profit NUMERIC GENERATED ALWAYS AS (gross_revenue - food_costs - labor_costs - other_expenses) STORED,
  tax_amount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cash', -- cash, credit, check, bank_transfer
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Payment History (extend existing client functionality)
CREATE TABLE public.client_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  payment_type TEXT DEFAULT 'full', -- deposit, partial, full, final
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client Preferences & Loyalty
CREATE TABLE public.client_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[],
  favorite_menu_items TEXT[],
  preferred_event_types TEXT[],
  special_requests TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications System
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'general', -- event_reminder, payment_due, inventory_low, task_due
  related_id UUID, -- can reference event_id, task_id, etc
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Roles & Permissions
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff', -- owner, manager, staff, accountant
  permissions TEXT[] DEFAULT '{}', -- read_events, write_events, read_inventory, etc
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all new tables
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific data
CREATE POLICY "Users can manage their own staff" ON public.staff
FOR ALL USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
));

CREATE POLICY "Users can manage their event assignments" ON public.staff_assignments
FOR ALL USING (EXISTS (
  SELECT 1 FROM events WHERE events.id = staff_assignments.event_id AND events.user_id = auth.uid()
));

CREATE POLICY "Users can manage their event data" ON public.event_milestones
FOR ALL USING (EXISTS (
  SELECT 1 FROM events WHERE events.id = event_milestones.event_id AND events.user_id = auth.uid()
));

CREATE POLICY "Users can manage their event tasks" ON public.event_tasks
FOR ALL USING (EXISTS (
  SELECT 1 FROM events WHERE events.id = event_tasks.event_id AND events.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own inventory" ON public.inventory_items
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own suppliers" ON public.suppliers
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own orders" ON public.supplier_orders
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their order items" ON public.order_line_items
FOR ALL USING (EXISTS (
  SELECT 1 FROM supplier_orders WHERE supplier_orders.id = order_line_items.order_id AND supplier_orders.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own menu items" ON public.menu_items
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their recipe ingredients" ON public.recipe_ingredients
FOR ALL USING (EXISTS (
  SELECT 1 FROM menu_items WHERE menu_items.id = recipe_ingredients.menu_item_id AND menu_items.user_id = auth.uid()
));

CREATE POLICY "Users can manage their own revenue records" ON public.revenue_records
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage client payments" ON public.client_payments
FOR ALL USING (true); -- Authenticated users can manage all client payments

CREATE POLICY "Users can manage client preferences" ON public.client_preferences
FOR ALL USING (true); -- Authenticated users can manage all client preferences

CREATE POLICY "Users can manage their own notifications" ON public.notifications
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage user roles" ON public.user_roles
FOR ALL USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'owner'
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON public.staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_orders_updated_at
BEFORE UPDATE ON public.supplier_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_tasks_updated_at
BEFORE UPDATE ON public.event_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at
BEFORE UPDATE ON public.client_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();