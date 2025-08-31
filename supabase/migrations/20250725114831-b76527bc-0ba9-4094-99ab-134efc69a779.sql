-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.calculate_booking_points(booking_amount NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1 point for every 100 currency units
  RETURN FLOOR(booking_amount / 100)::INTEGER;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customer_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Calculate points for this booking
  points_to_add := public.calculate_booking_points(NEW.total_amount);
  
  -- Insert or update customer points
  INSERT INTO public.customer_points (user_id, total_points, points_earned)
  VALUES (NEW.user_id, points_to_add, points_to_add)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = customer_points.total_points + points_to_add,
    points_earned = customer_points.points_earned + points_to_add,
    updated_at = now();
  
  -- Record the points for this booking
  INSERT INTO public.booking_points (booking_id, user_id, points_earned)
  VALUES (NEW.id, NEW.user_id, points_to_add);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;