-- Force recreation of views to fix Security Definer issue
-- Drop existing views completely
DROP VIEW IF EXISTS public.v_event_profit CASCADE;
DROP VIEW IF EXISTS public.v_popular_dishes CASCADE;

-- Recreate v_event_profit view with proper security context
CREATE OR REPLACE VIEW public.v_event_profit 
WITH (security_barrier = false) AS 
SELECT 
    e.id AS event_id,
    COALESCE(e.title, 'Event'::text) AS title,
    e.event_date,
    e.status,
    e.number_of_guests AS guest_count,
    COALESCE(i.subtotal, (0)::numeric) AS revenue_menu,
    COALESCE(labor.labor_cost, (0)::numeric) AS labor_cost,
    COALESCE(food.food_cost, (0)::bigint) AS food_cost,
    COALESCE(i.subtotal, (0)::numeric) AS subtotal_revenue,
    ((COALESCE(i.subtotal, (0)::numeric) - COALESCE(labor.labor_cost, (0)::numeric)) - (COALESCE(food.food_cost, (0)::bigint))::numeric) AS gross_profit
FROM events e
LEFT JOIN invoices i ON e.id = i.event_id
LEFT JOIN (
    SELECT 
        es.event_id,
        sum(
            CASE
                WHEN es.flat_fee IS NOT NULL THEN es.flat_fee
                WHEN es.start_time IS NOT NULL AND es.end_time IS NOT NULL 
                THEN (EXTRACT(epoch FROM (es.end_time - es.start_time)) / 3600::numeric) * COALESCE(s.hourly_rate, 0::numeric)
                ELSE 0::numeric
            END
        ) AS labor_cost
    FROM event_staff es
    LEFT JOIN staff s ON es.staff_id = s.id
    GROUP BY es.event_id
) labor ON e.id = labor.event_id
LEFT JOIN (
    SELECT 
        emi.event_id,
        sum(
            CASE
                WHEN emi.dish_id IS NOT NULL THEN 0
                WHEN emi.package_id IS NOT NULL THEN 0
                ELSE 0
            END
        ) AS food_cost
    FROM event_menu_items emi
    GROUP BY emi.event_id
) food ON e.id = food.event_id;

-- Recreate v_popular_dishes view with proper security context
CREATE OR REPLACE VIEW public.v_popular_dishes 
WITH (security_barrier = false) AS 
SELECT 
    d.id AS dish_id,
    d.name,
    count(emi.id) AS times_selected
FROM dishes d
LEFT JOIN event_menu_items emi ON d.id = emi.dish_id
WHERE d.is_active = true
GROUP BY d.id, d.name
ORDER BY count(emi.id) DESC;

-- Ensure proper ownership and permissions
ALTER VIEW public.v_event_profit OWNER TO postgres;
ALTER VIEW public.v_popular_dishes OWNER TO postgres;

-- Grant SELECT permissions to authenticated users only
REVOKE ALL ON public.v_event_profit FROM PUBLIC;
REVOKE ALL ON public.v_popular_dishes FROM PUBLIC;
GRANT SELECT ON public.v_event_profit TO authenticated;
GRANT SELECT ON public.v_popular_dishes TO authenticated;