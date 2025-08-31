-- Create potential_customers table
CREATE TABLE public.potential_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  mobile_number TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.potential_customers ENABLE ROW LEVEL SECURITY;

-- Create policies for potential_customers
CREATE POLICY "Allow all operations on potential_customers" 
ON public.potential_customers 
FOR ALL 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_potential_customers_updated_at
BEFORE UPDATE ON public.potential_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();