-- Check and fix the update_customer_points function ON CONFLICT issue
-- First, let's see the current function

-- Drop and recreate the function to fix the constraint issue
DROP FUNCTION IF EXISTS public.update_customer_points() CASCADE;

CREATE OR REPLACE FUNCTION public.update_customer_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Calculate points for this booking
  points_to_add := public.calculate_booking_points(NEW.total_amount);
  
  -- Insert or update customer points using user_id as the conflict column
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
$function$;

-- Re-create the trigger for bookings
DROP TRIGGER IF EXISTS booking_points_trigger ON public.bookings;
CREATE TRIGGER booking_points_trigger
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_points();