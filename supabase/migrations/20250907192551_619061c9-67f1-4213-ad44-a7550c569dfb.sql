-- Fix critical RLS policies for proper multi-tenancy
-- 1. Fix events table policies
DROP POLICY IF EXISTS "Users can manage their own events" ON public.events;
CREATE POLICY "Users can manage their own events" 
ON public.events 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Fix clients table - should be organization-scoped
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;

CREATE POLICY "Users can view organization clients" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can insert organization clients" 
ON public.clients 
FOR INSERT 
TO authenticated 
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update organization clients" 
ON public.clients 
FOR UPDATE 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete organization clients" 
ON public.clients 
FOR DELETE 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 3. Fix dishes table for proper user isolation
DROP POLICY IF EXISTS "Users can manage their dishes" ON public.dishes;
CREATE POLICY "Users can manage their dishes" 
ON public.dishes 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Fix invoices table - currently allows access to all data
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Authenticated users can delete invoices" ON public.invoices;

CREATE POLICY "Users can view organization invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage organization invoices" 
ON public.invoices 
FOR INSERT 
TO authenticated 
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update organization invoices" 
ON public.invoices 
FOR UPDATE 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete organization invoices" 
ON public.invoices 
FOR DELETE 
TO authenticated 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 5. Add organization_id to profiles table if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- 6. Make user_id NOT NULL where it should be required
ALTER TABLE public.events 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.labor_roles 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.saved_reports 
ALTER COLUMN user_id SET NOT NULL;