
-- Create a table to store monthly expenses data
CREATE TABLE public.monthly_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  direct_expenses JSONB DEFAULT '[]'::jsonb,
  salary_expenses JSONB DEFAULT '[]'::jsonb,
  repair_maintenance JSONB DEFAULT '[]'::jsonb,
  deposits NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month)
);

-- Enable RLS
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (admin access)
CREATE POLICY "Allow all operations on monthly_expenses" 
  ON public.monthly_expenses 
  FOR ALL 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_monthly_expenses_updated_at
  BEFORE UPDATE ON public.monthly_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
