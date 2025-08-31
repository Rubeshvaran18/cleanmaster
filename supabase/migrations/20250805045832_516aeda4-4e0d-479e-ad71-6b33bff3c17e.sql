
-- Create daily salary records table
CREATE TABLE public.daily_salary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  daily_salary NUMERIC NOT NULL DEFAULT 0,
  hours_worked NUMERIC DEFAULT 8,
  overtime_hours NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  allowances NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Add check-in and check-out times to attendance table
ALTER TABLE public.attendance 
ADD COLUMN check_in_time TIME,
ADD COLUMN check_out_time TIME,
ADD COLUMN total_hours NUMERIC DEFAULT 0;

-- Create manager revenue tracking table
CREATE TABLE public.manager_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manager_id TEXT NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  revenue_generated NUMERIC NOT NULL DEFAULT 0,
  expenses NUMERIC DEFAULT 0,
  profit NUMERIC NOT NULL DEFAULT 0,
  tasks_received INTEGER DEFAULT 0,
  task_amounts NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(manager_id, date)
);

-- Enable RLS for new tables
ALTER TABLE public.daily_salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on daily_salary_records" 
  ON public.daily_salary_records 
  FOR ALL 
  USING (true);

CREATE POLICY "Allow all operations on manager_revenue" 
  ON public.manager_revenue 
  FOR ALL 
  USING (true);

-- Create trigger to update updated_at column
CREATE TRIGGER update_daily_salary_records_updated_at
  BEFORE UPDATE ON public.daily_salary_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manager_revenue_updated_at
  BEFORE UPDATE ON public.manager_revenue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
