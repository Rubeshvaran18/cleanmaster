
-- Fix user_roles table to properly store user details and create customers table
-- Also fix the handle_new_user function and add proper employee ID generation

-- First, let's fix the user_roles table to ensure it captures user details properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert into user_roles table with customer role by default
  INSERT INTO public.user_roles (user_id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, user_roles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_roles.last_name),
    updated_at = now();
  
  -- Also create a user profile entry
  INSERT INTO public.user_profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Create a customers table to store all customer details
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  registration_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Admins can manage all customers" 
ON public.customers 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::app_role);

CREATE POLICY "Users can view their own customer record" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer record" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate employee ID in MK001, MK002 format
CREATE OR REPLACE FUNCTION public.generate_employee_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $function$
DECLARE
  next_id INTEGER;
  formatted_id TEXT;
BEGIN
  -- Get the next sequence number by counting existing employees
  SELECT COUNT(*) + 1 INTO next_id FROM public.employees;
  
  -- Format as MK001, MK002, etc.
  formatted_id := 'MK' || LPAD(next_id::TEXT, 3, '0');
  
  -- Check if this ID already exists (in case of concurrent inserts)
  WHILE EXISTS (SELECT 1 FROM public.employees WHERE id = formatted_id) LOOP
    next_id := next_id + 1;
    formatted_id := 'MK' || LPAD(next_id::TEXT, 3, '0');
  END LOOP;
  
  RETURN formatted_id;
END;
$function$;

-- Update existing employees to have proper MK format IDs if they don't already
DO $$
DECLARE
  emp_record RECORD;
  counter INTEGER := 1;
  new_id TEXT;
BEGIN
  FOR emp_record IN SELECT * FROM public.employees WHERE id NOT LIKE 'MK%' ORDER BY created_at LOOP
    new_id := 'MK' || LPAD(counter::TEXT, 3, '0');
    
    -- Make sure the new ID doesn't already exist
    WHILE EXISTS (SELECT 1 FROM public.employees WHERE id = new_id) LOOP
      counter := counter + 1;
      new_id := 'MK' || LPAD(counter::TEXT, 3, '0');
    END LOOP;
    
    UPDATE public.employees SET id = new_id WHERE id = emp_record.id;
    counter := counter + 1;
  END LOOP;
END $$;
