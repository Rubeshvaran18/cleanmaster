-- Update RLS policies for customer_points to fix the function issue
DROP POLICY IF EXISTS "Admins can view all customer points" ON public.customer_points;

-- Create a simpler policy that allows admins to view all customer points
CREATE POLICY "Admins can view all customer points" 
ON public.customer_points 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);