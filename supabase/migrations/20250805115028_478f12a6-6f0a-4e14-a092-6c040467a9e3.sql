-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT DEFAULT 'Event Planning Business',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create labor roles table
CREATE TABLE IF NOT EXISTS public.labor_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  labor_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.labor_roles ENABLE ROW LEVEL SECURITY;

-- Labor roles policies
CREATE POLICY "Users can manage their own labor roles" 
ON public.labor_roles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create budget profiles table
CREATE TABLE IF NOT EXISTS public.budget_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  labor_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  food_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  taxes_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  profit_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budget_profiles ENABLE ROW LEVEL SECURITY;

-- Budget profiles policies
CREATE POLICY "Users can manage their own budget profiles" 
ON public.budget_profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  labor_revenue_percentage DECIMAL(5,2) NOT NULL DEFAULT 30,
  expense_types TEXT[] DEFAULT ARRAY['Equipment Rental', 'Transportation', 'Utilities', 'Insurance', 'Marketing', 'Supplies'],
  food_cost_types TEXT[] DEFAULT ARRAY['Proteins', 'Vegetables', 'Grains', 'Dairy', 'Beverages', 'Seasonings'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Admin settings policies
CREATE POLICY "Users can manage their own admin settings" 
ON public.admin_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user profile and default data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, first_name, last_name, business_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'Event Planning Business'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_labor_roles_updated_at
  BEFORE UPDATE ON public.labor_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_profiles_updated_at
  BEFORE UPDATE ON public.budget_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();