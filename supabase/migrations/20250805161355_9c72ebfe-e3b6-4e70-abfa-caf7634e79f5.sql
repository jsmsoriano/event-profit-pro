-- Fix search path security issues for functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';