-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('client', 'staff', 'manager', 'owner', 'accountant');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create function to get user primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'owner' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'accountant' THEN 3
      WHEN 'staff' THEN 4
      WHEN 'client' THEN 5
    END
  LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owners and managers can manage all roles"
ON public.user_roles
FOR ALL
USING (
  public.has_role(auth.uid(), 'owner') OR 
  public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Staff can view all user roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'staff') OR
  public.has_role(auth.uid(), 'accountant')
);

-- Insert default owner role for existing users (if any)
-- This is safe to run even if no users exist
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE id NOT IN (SELECT DISTINCT user_id FROM public.user_roles)
        LIMIT 1
    LOOP
        INSERT INTO public.user_roles (user_id, role, assigned_by)
        VALUES (user_record.id, 'owner', user_record.id);
    END LOOP;
END $$;

-- Update the existing handle_new_user function to assign default client role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, first_name, last_name, business_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'Event Planning Business'
  );
  
  -- Assign default client role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (NEW.id, 'client', NEW.id);
  
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
$function$