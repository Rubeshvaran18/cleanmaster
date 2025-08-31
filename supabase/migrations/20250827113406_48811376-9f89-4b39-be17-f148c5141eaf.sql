
-- Add the missing task_completed column to customer_records table
ALTER TABLE public.customer_records 
ADD COLUMN task_completed boolean DEFAULT false;
