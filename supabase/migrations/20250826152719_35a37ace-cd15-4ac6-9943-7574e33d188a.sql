
-- Add employment_type column to employees table
ALTER TABLE public.employees 
ADD COLUMN employment_type text DEFAULT 'full-time';

-- Update existing records to have a default value
UPDATE public.employees 
SET employment_type = 'full-time' 
WHERE employment_type IS NULL;
