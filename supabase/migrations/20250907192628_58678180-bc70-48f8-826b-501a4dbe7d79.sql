-- Fix remaining security issues
-- 1. Fix the security definer views
DROP VIEW IF EXISTS public.v_event_profit;
CREATE VIEW public.v_event_profit 
WITH (security_barrier = false) AS
SELECT 
  e.id as event_id,
  e.event_date,
  e.number_of_guests as guest_count,
  COALESCE(e.total_revenue, 0) as revenue_menu,
  COALESCE(e.labor_cost, 0) as labor_cost,
  COALESCE(e.food_cost, 0) as food_cost,
  COALESCE(e.total_revenue, 0) as subtotal_revenue,
  COALESCE(e.total_revenue, 0) - COALESCE(e.labor_cost, 0) - COALESCE(e.food_cost, 0) as gross_profit,
  e.status,
  e.client_name as title
FROM public.events e
WHERE e.user_id = auth.uid();

DROP VIEW IF EXISTS public.v_popular_dishes;
CREATE VIEW public.v_popular_dishes 
WITH (security_barrier = false) AS
SELECT 
  d.id as dish_id,
  d.name,
  COUNT(ei.dish_id) as times_selected
FROM public.dishes d
LEFT JOIN public.event_menu_items ei ON d.id = ei.dish_id
LEFT JOIN public.events e ON ei.event_id = e.id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.name
ORDER BY times_selected DESC;

-- 2. Create function to auto-assign users to default organization
CREATE OR REPLACE FUNCTION public.get_or_create_default_organization(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Check if user already has an organization
  SELECT organization_id INTO org_id 
  FROM public.profiles 
  WHERE id = user_id 
  AND organization_id IS NOT NULL;
  
  IF org_id IS NOT NULL THEN
    RETURN org_id;
  END IF;
  
  -- Create a new organization for this user
  INSERT INTO public.organizations (name, created_at, updated_at)
  VALUES ('Default Organization', now(), now())
  RETURNING id INTO org_id;
  
  -- Update user profile with organization
  UPDATE public.profiles 
  SET organization_id = org_id 
  WHERE id = user_id;
  
  RETURN org_id;
END;
$$;

-- 3. Update handle_new_user function to assign organization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Create default organization for user
  INSERT INTO public.organizations (name, created_at, updated_at)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'My Catering Business'),
    now(), 
    now()
  )
  RETURNING id INTO org_id;

  -- Create profile with organization and role support
  INSERT INTO public.profiles (id, first_name, last_name, business_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'business_name', 'My Catering Business'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'admin'),
    org_id
  );
  
  -- Create default admin settings
  INSERT INTO public.admin_settings (user_id)
  VALUES (NEW.id);
  
  -- Create default budget profiles
  INSERT INTO public.budget_profiles (user_id, name, labor_percent, food_percent, taxes_percent, profit_percent, is_default)
  VALUES 
    (NEW.id, 'Cash Only', 55, 35, 0, 10, false),
    (NEW.id, 'Credit Card Payments', 30, 35, 20, 15, true);
  
  -- Create default labor roles
  INSERT INTO public.labor_roles (user_id, name, labor_percentage)
  VALUES 
    (NEW.id, 'Chef', 60),
    (NEW.id, 'Assistant', 40);
  
  RETURN NEW;
END;
$$;