
-- Add unique constraint on user_id in customer_points table to fix ON CONFLICT issue
ALTER TABLE public.customer_points ADD CONSTRAINT customer_points_user_id_unique UNIQUE (user_id);
