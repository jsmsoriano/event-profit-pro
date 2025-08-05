-- Fix search path security issue for log_status_change function
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.credentialing_timeline (application_id, status, notes, created_by)
        VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status, 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for update_claim_ar_fields function
CREATE OR REPLACE FUNCTION public.update_claim_ar_fields()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for update_claim_after_payment function
CREATE OR REPLACE FUNCTION public.update_claim_after_payment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for log_task_changes function
CREATE OR REPLACE FUNCTION public.log_task_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for create_standard_checklist function
CREATE OR REPLACE FUNCTION public.create_standard_checklist(period_id uuid)
RETURNS void AS $$
BEGIN
    INSERT INTO public.month_end_checklist_items (period_id, item_name, description, is_auto_checkable, sort_order)
    VALUES
        (period_id, 'Submit all open claims', 'Ensure all claims for the month have been submitted', true, 1),
        (period_id, 'Resolve denials', 'Address all denied claims and resubmit or appeal', true, 2),
        (period_id, 'Reconcile payments', 'Match all payments with corresponding claims', true, 3),
        (period_id, 'Download reports', 'Generate and download AR, Claims, Denials, Payments, and Productivity reports', false, 4),
        (period_id, 'Manager sign-off', 'Final approval from AR Manager or Admin', false, 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for check_month_end_auto_items function
CREATE OR REPLACE FUNCTION public.check_month_end_auto_items(period_year integer, period_month integer)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix search path for get_user_subscription_limit function
CREATE OR REPLACE FUNCTION public.get_user_subscription_limit(user_id uuid, feature_name text)
RETURNS integer AS $$
  SELECT sf.feature_limit
  FROM public.profiles p
  JOIN public.subscription_features sf ON p.subscription_tier = sf.tier
  WHERE p.id = user_id 
    AND sf.feature_name = get_user_subscription_limit.feature_name
    AND p.is_active = true;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '';