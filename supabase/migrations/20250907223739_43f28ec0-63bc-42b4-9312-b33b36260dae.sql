-- Add proper RLS policies for sensitive tables and fix remaining security issues

-- Add proper RLS policies for sensitive tables
DROP POLICY IF EXISTS "Users can view task history" ON public.task_history;
CREATE POLICY "Users can view their task history" ON public.task_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_history.task_id 
    AND tasks.created_by = auth.uid()::text
  )
);

-- Month end data should be restricted to admin users
DROP POLICY IF EXISTS "Authenticated users can manage checklist items" ON public.month_end_checklist_items;
CREATE POLICY "Admin users can manage checklist items" ON public.month_end_checklist_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create month_end_periods table if it doesn't exist and add RLS
CREATE TABLE IF NOT EXISTS public.month_end_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL,
  status text NOT NULL DEFAULT 'open',
  closed_at timestamp with time zone,
  closed_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(year, month)
);

ALTER TABLE public.month_end_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users can manage periods" ON public.month_end_periods;
CREATE POLICY "Admin users can manage periods" ON public.month_end_periods
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Authenticated users can view audit log" ON public.month_end_audit_log;
CREATE POLICY "Admin users can view audit log" ON public.month_end_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Wiki categories should be restricted to authenticated users
DROP POLICY IF EXISTS "Anyone can view wiki categories" ON public.wiki_categories;
CREATE POLICY "Authenticated users can view wiki categories" ON public.wiki_categories
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Subscription features should be restricted to authenticated users  
DROP POLICY IF EXISTS "Anyone can view subscription features" ON public.subscription_features;
CREATE POLICY "Authenticated users can view subscription features" ON public.subscription_features
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix remaining functions with mutable search paths
CREATE OR REPLACE FUNCTION public.update_claim_after_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Update the parent claim's balance and status
  UPDATE public.claims 
  SET 
    payment_amount = (
      SELECT SUM(payment_amount) 
      FROM public.payments 
      WHERE claim_id = NEW.claim_id
    ),
    payment_date = (
      SELECT MAX(payment_date) 
      FROM public.payments 
      WHERE claim_id = NEW.claim_id
    ),
    status = CASE 
      WHEN (SELECT SUM(payment_amount) FROM public.payments WHERE claim_id = NEW.claim_id) >= amount 
      THEN 'paid'
      WHEN (SELECT SUM(payment_amount) FROM public.payments WHERE claim_id = NEW.claim_id) > 0 
      THEN 'partially_paid'
      ELSE status
    END
  WHERE id = NEW.claim_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.credentialing_timeline (application_id, status, notes, created_by)
        VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status, 'system');
    END IF;
    RETURN NEW;
END;
$function$;