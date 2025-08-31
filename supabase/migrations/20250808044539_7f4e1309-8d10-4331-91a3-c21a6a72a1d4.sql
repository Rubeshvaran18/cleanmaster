
-- Create a table for manpower/hiring records
CREATE TABLE public.manpower_hiring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  age INTEGER,
  address TEXT,
  source TEXT,
  status TEXT DEFAULT 'Yet to join' CHECK (status IN ('Joining today', 'Not responding', 'Joined', 'Yet to join')),
  employee_type TEXT,
  position TEXT,
  joining_date DATE,
  interview_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.manpower_hiring ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations (since this is admin functionality)
CREATE POLICY "Allow all operations on manpower_hiring" 
  ON public.manpower_hiring 
  FOR ALL 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_manpower_hiring_updated_at
  BEFORE UPDATE ON public.manpower_hiring
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
