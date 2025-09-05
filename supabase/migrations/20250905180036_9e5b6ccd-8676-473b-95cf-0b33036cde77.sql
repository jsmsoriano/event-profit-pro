-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.v_event_profit;
DROP VIEW IF EXISTS public.v_popular_dishes;

-- Recreate views as regular views (not SECURITY DEFINER)
CREATE VIEW public.v_event_profit AS
SELECT 
  e.id as event_id,
  COALESCE(e.title, 'Event') as title,
  e.event_date,
  e.status,
  e.number_of_guests as guest_count,
  COALESCE(i.subtotal, 0) as revenue_menu,
  COALESCE(labor.labor_cost, 0) as labor_cost,
  COALESCE(food.food_cost, 0) as food_cost,
  COALESCE(i.subtotal, 0) as subtotal_revenue,
  COALESCE(i.subtotal, 0) - COALESCE(labor.labor_cost, 0) - COALESCE(food.food_cost, 0) as gross_profit
FROM public.events e
LEFT JOIN public.invoices i ON e.id = i.event_id
LEFT JOIN (
  SELECT 
    es.event_id,
    SUM(
      CASE 
        WHEN es.flat_fee IS NOT NULL THEN es.flat_fee
        WHEN es.start_time IS NOT NULL AND es.end_time IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (es.end_time - es.start_time)) / 3600 * COALESCE(s.hourly_rate, 0)
        ELSE 0
      END
    ) as labor_cost
  FROM public.event_staff es
  LEFT JOIN public.staff s ON es.staff_id = s.id
  GROUP BY es.event_id
) labor ON e.id = labor.event_id
LEFT JOIN (
  SELECT 
    emi.event_id,
    SUM(
      CASE 
        WHEN emi.dish_id IS NOT NULL THEN 0 -- Simplified for MVP
        WHEN emi.package_id IS NOT NULL THEN 0 -- Simplified for MVP  
        ELSE 0
      END
    ) as food_cost
  FROM public.event_menu_items emi
  GROUP BY emi.event_id
) food ON e.id = food.event_id;

CREATE VIEW public.v_popular_dishes AS
SELECT 
  d.id as dish_id,
  d.name,
  COUNT(emi.id) as times_selected
FROM public.dishes d
LEFT JOIN public.event_menu_items emi ON d.id = emi.dish_id
WHERE d.is_active = true
GROUP BY d.id, d.name
ORDER BY times_selected DESC;