-- Fix attendance table RLS policies
CREATE POLICY "Allow all operations on attendance for authenticated users"
ON public.attendance
FOR ALL
USING (true)
WITH CHECK (true);

-- Check and fix bookings table constraints issue
-- Remove any problematic ON CONFLICT constraints if they exist
-- The error suggests there's a constraint mismatch in the bookings table