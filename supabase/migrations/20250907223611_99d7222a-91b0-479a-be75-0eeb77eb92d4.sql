-- Fix critical security and data integrity issues

-- Add missing columns to dishes table for hibachi dinner support
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS protein_types text[];
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS side_types text[];
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS vegetable_type text;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS appetizer_type text;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS chicken_count integer DEFAULT 0;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS steak_count integer DEFAULT 0;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS shrimp_count integer DEFAULT 0;
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS protein_upgrades jsonb DEFAULT '[]'::jsonb;

-- Fix security definer views by recreating them with correct column references
DROP VIEW IF EXISTS public.v_event_profit;
CREATE VIEW public.v_event_profit 
WITH (security_barrier = false) AS
SELECT 
    e.id as event_id,
    e.event_date,
    e.number_of_guests as guest_count,
    e.total_revenue as revenue_menu,
    e.labor_cost,
    e.food_cost,
    e.total_revenue as subtotal_revenue,
    (e.total_revenue - COALESCE(e.labor_cost, 0) - COALESCE(e.food_cost, 0)) as gross_profit,
    e.status,
    e.title
FROM public.events e
WHERE e.user_id = auth.uid();

DROP VIEW IF EXISTS public.v_popular_dishes;
CREATE VIEW public.v_popular_dishes 
WITH (security_barrier = false) AS
SELECT 
    d.id as dish_id,
    d.name,
    COUNT(emi.dish_id) as times_selected
FROM public.dishes d
LEFT JOIN public.event_menu_items emi ON d.id = emi.dish_id
LEFT JOIN public.events e ON emi.event_id = e.id
WHERE d.user_id = auth.uid() AND (e.user_id = auth.uid() OR e.user_id IS NULL)
GROUP BY d.id, d.name
ORDER BY times_selected DESC;

-- Fix functions with mutable search paths
CREATE OR REPLACE FUNCTION public.set_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.wiki_articles WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_task_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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