-- Phase 1: Enable RLS on unprotected tables and add security policies

-- Enable RLS on credentialing_doctors table
ALTER TABLE public.credentialing_doctors ENABLE ROW LEVEL SECURITY;

-- RLS policies for credentialing_doctors
CREATE POLICY "Authenticated users can view doctors" 
ON public.credentialing_doctors 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create doctors" 
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

-- Enable RLS on credentialing_applications table
ALTER TABLE public.credentialing_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for credentialing_applications
CREATE POLICY "Authenticated users can view applications" 
ON public.credentialing_applications 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create applications" 
ON public.credentialing_applications 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update applications" 
ON public.credentialing_applications 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete applications" 
ON public.credentialing_applications 
FOR DELETE 
TO authenticated
USING (true);

-- Enable RLS on credentialing_documents table
ALTER TABLE public.credentialing_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for credentialing_documents
CREATE POLICY "Authenticated users can view documents" 
ON public.credentialing_documents 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create documents" 
ON public.credentialing_documents 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents" 
ON public.credentialing_documents 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete documents" 
ON public.credentialing_documents 
FOR DELETE 
TO authenticated
USING (true);

-- Enable RLS on credentialing_timeline table
ALTER TABLE public.credentialing_timeline ENABLE ROW LEVEL SECURITY;

-- RLS policies for credentialing_timeline
CREATE POLICY "Authenticated users can view timeline" 
ON public.credentialing_timeline 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create timeline entries" 
ON public.credentialing_timeline 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update timeline entries" 
ON public.credentialing_timeline 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete timeline entries" 
ON public.credentialing_timeline 
FOR DELETE 
TO authenticated
USING (true);

-- Phase 2: Harden database functions with proper security settings

-- Update log_status_change function
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.credentialing_timeline (application_id, status, notes, created_by)
        VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status, 'system');
    END IF;
    RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, business_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    'Excel Billing'
  );
  RETURN new;
END;
$function$;

-- Update update_claim_ar_fields function
CREATE OR REPLACE FUNCTION public.update_claim_ar_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Calculate days outstanding from submission date
  NEW.days_outstanding = COALESCE(
    DATE_PART('day', CURRENT_DATE - NEW.submission_date)::INTEGER, 
    0
  );
  
  -- Calculate balance due (claim amount - total payments)
  NEW.balance_due = NEW.amount - COALESCE(
    (SELECT SUM(payment_amount) 
     FROM public.payments 
     WHERE claim_id = NEW.id), 
    0
  );
  
  RETURN NEW;
END;
$function$;

-- Update update_claim_after_payment function
CREATE OR REPLACE FUNCTION public.update_claim_after_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

-- Update log_task_changes function
CREATE OR REPLACE FUNCTION public.log_task_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Log task creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.task_history (task_id, action_type, changed_by, notes)
    VALUES (NEW.id, 'created', NEW.created_by, 'Task created');
    RETURN NEW;
  END IF;

  -- Log task updates
  IF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.task_history (task_id, action_type, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'status_changed', 'status', OLD.status, NEW.status, 'system');
    END IF;

    -- Log assignment changes
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO public.task_history (task_id, action_type, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'assigned', 'assigned_to', OLD.assigned_to, NEW.assigned_to, 'system');
    END IF;

    -- Log priority changes
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO public.task_history (task_id, action_type, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'updated', 'priority', OLD.priority, NEW.priority, 'system');
    END IF;

    -- Log due date changes
    IF OLD.due_date IS DISTINCT FROM NEW.due_date THEN
      INSERT INTO public.task_history (task_id, action_type, field_name, old_value, new_value, changed_by)
      VALUES (NEW.id, 'updated', 'due_date', OLD.due_date::text, NEW.due_date::text, 'system');
    END IF;

    -- Log completion
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
      INSERT INTO public.task_history (task_id, action_type, changed_by, notes)
      VALUES (NEW.id, 'completed', COALESCE(NEW.completed_by, 'system'), 'Task marked as completed');
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

-- Update create_standard_checklist function
CREATE OR REPLACE FUNCTION public.create_standard_checklist(period_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.month_end_checklist_items (period_id, item_name, description, is_auto_checkable, sort_order)
    VALUES
        (period_id, 'Submit all open claims', 'Ensure all claims for the month have been submitted', true, 1),
        (period_id, 'Resolve denials', 'Address all denied claims and resubmit or appeal', true, 2),
        (period_id, 'Reconcile payments', 'Match all payments with corresponding claims', true, 3),
        (period_id, 'Download reports', 'Generate and download AR, Claims, Denials, Payments, and Productivity reports', false, 4),
        (period_id, 'Manager sign-off', 'Final approval from AR Manager or Admin', false, 5);
END;
$function$;

-- Update check_month_end_auto_items function
CREATE OR REPLACE FUNCTION public.check_month_end_auto_items(period_year integer, period_month integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    period_id UUID;
    month_start DATE;
    month_end DATE;
    open_claims_count INTEGER;
    unresolved_denials_count INTEGER;
    pending_payments_count INTEGER;
BEGIN
    -- Get period ID
    SELECT id INTO period_id 
    FROM public.month_end_periods 
    WHERE year = period_year AND month = period_month;
    
    IF period_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate month boundaries
    month_start := DATE(period_year || '-' || LPAD(period_month::TEXT, 2, '0') || '-01');
    month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Check open claims
    SELECT COUNT(*) INTO open_claims_count
    FROM public.claims
    WHERE status != 'submitted' 
    AND service_date <= month_end;
    
    IF open_claims_count = 0 THEN
        UPDATE public.month_end_checklist_items
        SET is_completed = true, completed_at = now(), completed_by = 'system'
        WHERE period_id = period_id 
        AND item_name = 'Submit all open claims'
        AND NOT is_completed;
    END IF;
    
    -- Check unresolved denials
    SELECT COUNT(*) INTO unresolved_denials_count
    FROM public.claims
    WHERE status = 'denied' 
    AND (denial_reason IS NOT NULL AND denial_reason != '');
    
    IF unresolved_denials_count = 0 THEN
        UPDATE public.month_end_checklist_items
        SET is_completed = true, completed_at = now(), completed_by = 'system'
        WHERE period_id = period_id 
        AND item_name = 'Resolve denials'
        AND NOT is_completed;
    END IF;
    
    -- Check pending payments reconciliation
    SELECT COUNT(*) INTO pending_payments_count
    FROM public.payments p
    JOIN public.claims c ON p.claim_id = c.id
    WHERE c.service_date <= month_end 
    AND c.payment_amount IS NULL;
    
    IF pending_payments_count = 0 THEN
        UPDATE public.month_end_checklist_items
        SET is_completed = true, completed_at = now(), completed_by = 'system'
        WHERE period_id = period_id 
        AND item_name = 'Reconcile payments'
        AND NOT is_completed;
    END IF;
END;
$function$;