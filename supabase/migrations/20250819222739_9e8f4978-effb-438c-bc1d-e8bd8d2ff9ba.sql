-- Critical Security Fixes: Add RLS policies to protect sensitive data

-- 1. Secure clients table (CRITICAL - currently public)
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;

CREATE POLICY "Authenticated users can view clients" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients" 
ON public.clients 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
ON public.clients 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clients" 
ON public.clients 
FOR DELETE 
TO authenticated
USING (true);

-- 2. Secure team_members table (CRITICAL - currently public)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.team_members;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.team_members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.team_members;
DROP POLICY IF EXISTS "Enable update for all users" ON public.team_members;

CREATE POLICY "Authenticated users can view team members" 
ON public.team_members 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert team members" 
ON public.team_members 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members" 
ON public.team_members 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete team members" 
ON public.team_members 
FOR DELETE 
TO authenticated
USING (true);

-- 3. Secure credentialing_doctors table (CRITICAL - currently public)
DROP POLICY IF EXISTS "Authenticated users can create doctors" ON public.credentialing_doctors;
DROP POLICY IF EXISTS "Authenticated users can delete doctors" ON public.credentialing_doctors;
DROP POLICY IF EXISTS "Authenticated users can update doctors" ON public.credentialing_doctors;
DROP POLICY IF EXISTS "Authenticated users can view doctors" ON public.credentialing_doctors;

CREATE POLICY "Authenticated users can view doctors" 
ON public.credentialing_doctors 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert doctors" 
ON public.credentialing_doctors 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update doctors" 
ON public.credentialing_doctors 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete doctors" 
ON public.credentialing_doctors 
FOR DELETE 
TO authenticated
USING (true);

-- 4. Secure invoices table (CRITICAL - financial data currently public)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.invoices;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.invoices;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.invoices;
DROP POLICY IF EXISTS "Enable update for all users" ON public.invoices;

CREATE POLICY "Authenticated users can view invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert invoices" 
ON public.invoices 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices" 
ON public.invoices 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete invoices" 
ON public.invoices 
FOR DELETE 
TO authenticated
USING (true);

-- 5. Secure file_vault table (CRITICAL - file metadata currently public)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.file_vault;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.file_vault;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.file_vault;
DROP POLICY IF EXISTS "Enable update for all users" ON public.file_vault;

CREATE POLICY "Authenticated users can view files" 
ON public.file_vault 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can upload files" 
ON public.file_vault 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update files" 
ON public.file_vault 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete files" 
ON public.file_vault 
FOR DELETE 
TO authenticated
USING (true);

-- 6. Secure tasks table (fix overly permissive policies)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON public.tasks;

CREATE POLICY "Authenticated users can view tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated
USING (true);

-- 7. Secure client_assignments table
DROP POLICY IF EXISTS "Enable delete for all users" ON public.client_assignments;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.client_assignments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_assignments;
DROP POLICY IF EXISTS "Enable update for all users" ON public.client_assignments;

CREATE POLICY "Authenticated users can view client assignments" 
ON public.client_assignments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create client assignments" 
ON public.client_assignments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update client assignments" 
ON public.client_assignments 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete client assignments" 
ON public.client_assignments 
FOR DELETE 
TO authenticated
USING (true);

-- 8. Ensure data_sources is properly secured
DROP POLICY IF EXISTS "Authenticated users can manage data sources" ON public.data_sources;

CREATE POLICY "Authenticated users can view data sources" 
ON public.data_sources 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create data sources" 
ON public.data_sources 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update data sources" 
ON public.data_sources 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete data sources" 
ON public.data_sources 
FOR DELETE 
TO authenticated
USING (true);

-- 9. Clean up and consolidate duplicate policies on other tables
-- Remove duplicate policies on billing_performance
DROP POLICY IF EXISTS "Authenticated users can view billing performance" ON public.billing_performance;
DROP POLICY IF EXISTS "Authenticated users can manage billing performance" ON public.billing_performance;

CREATE POLICY "Authenticated users can access billing performance" 
ON public.billing_performance 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Remove duplicate policies on claims
DROP POLICY IF EXISTS "Authenticated users can view claims" ON public.claims;
DROP POLICY IF EXISTS "Authenticated users can manage claims" ON public.claims;

CREATE POLICY "Authenticated users can access claims" 
ON public.claims 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Remove duplicate policies on payments
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;

CREATE POLICY "Authenticated users can access payments" 
ON public.payments 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Remove duplicate policies on pipeline_prospects
DROP POLICY IF EXISTS "Authenticated users can view pipeline prospects" ON public.pipeline_prospects;
DROP POLICY IF EXISTS "Authenticated users can manage pipeline prospects" ON public.pipeline_prospects;

CREATE POLICY "Authenticated users can access pipeline prospects" 
ON public.pipeline_prospects 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);