-- Create customer_records table
CREATE TABLE public.customer_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  booking_date DATE NOT NULL,
  email TEXT,
  task_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  discount_points INTEGER DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Unpaid', 'Partial')),
  source TEXT NOT NULL,
  task_done_by TEXT[] DEFAULT '{}',
  customer_notes TEXT,
  customer_rating TEXT DEFAULT 'Normal' CHECK (customer_rating IN ('Very Good', 'Good', 'Normal', 'Poor', 'Bad')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations on customer_records" 
  ON public.customer_records 
  FOR ALL 
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_customer_records_updated_at
  BEFORE UPDATE ON public.customer_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();