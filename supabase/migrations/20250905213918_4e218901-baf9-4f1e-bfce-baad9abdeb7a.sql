-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');

-- Add role column to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN role app_role NOT NULL DEFAULT 'customer';

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- Update the existing handle_new_user function to include role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile with role support
  INSERT INTO public.profiles (id, first_name, last_name, business_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'Event Planning Business',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'customer')
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