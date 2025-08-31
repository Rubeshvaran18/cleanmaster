-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT NOT NULL UNIQUE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('vehicle', 'equipment', 'material')),
  taken_by TEXT,
  check_out_time TIMESTAMP WITH TIME ZONE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  defects_damage TEXT,
  notes TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all assets
CREATE POLICY "Allow all operations on assets" 
ON public.assets 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add revenue_processed column to bookings if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'revenue_processed') THEN
        ALTER TABLE public.bookings ADD COLUMN revenue_processed BOOLEAN DEFAULT false;
    END IF;
END $$;