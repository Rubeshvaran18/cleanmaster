
-- Add unique constraint to customer_points table for the ON CONFLICT clause to work
ALTER TABLE public.customer_points ADD CONSTRAINT customer_points_user_id_key UNIQUE (user_id);

-- Create employees table if it doesn't exist with proper structure for Supabase integration
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  age INTEGER,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  salary NUMERIC DEFAULT 0,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Active',
  blood_group TEXT,
  driving_license_url TEXT,
  aadhar_card_url TEXT,
  advance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policy for employees table
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
