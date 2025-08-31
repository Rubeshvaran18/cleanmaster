-- Create storage buckets for user documents
INSERT INTO storage.buckets (id, name, public) VALUES 
('customer-avatars', 'customer-avatars', true),
('booking-attachments', 'booking-attachments', false);

-- Create customer points table
CREATE TABLE public.customer_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create booking points history table
CREATE TABLE public.booking_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.customer_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_points
CREATE POLICY "Users can view their own points" 
ON public.customer_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points" 
ON public.customer_points 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points" 
ON public.customer_points 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for booking_points
CREATE POLICY "Users can view their own booking points" 
ON public.booking_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own booking points" 
ON public.booking_points 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Update bookings table to include user_id
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create RLS policies for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin policies for all tables
CREATE POLICY "Admins can view all customer points" 
ON public.customer_points 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can view all booking points" 
ON public.booking_points 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR ALL 
USING (public.get_user_role(auth.uid()) = 'admin');

-- Create storage policies for customer avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'customer-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'customer-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for booking attachments
CREATE POLICY "Users can view their own booking attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'booking-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own booking attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'booking-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to calculate points based on booking amount
CREATE OR REPLACE FUNCTION public.calculate_booking_points(booking_amount NUMERIC)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 1 point for every 100 currency units
  RETURN FLOOR(booking_amount / 100)::INTEGER;
END;
$$;

-- Function to update customer points
CREATE OR REPLACE FUNCTION public.update_customer_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Calculate points for this booking
  points_to_add := public.calculate_booking_points(NEW.total_amount);
  
  -- Insert or update customer points
  INSERT INTO public.customer_points (user_id, total_points, points_earned)
  VALUES (NEW.user_id, points_to_add, points_to_add)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = customer_points.total_points + points_to_add,
    points_earned = customer_points.points_earned + points_to_add,
    updated_at = now();
  
  -- Record the points for this booking
  INSERT INTO public.booking_points (booking_id, user_id, points_earned)
  VALUES (NEW.id, NEW.user_id, points_to_add);
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update points when booking is created
CREATE TRIGGER update_points_on_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_points();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer_points timestamps
CREATE TRIGGER update_customer_points_updated_at
  BEFORE UPDATE ON public.customer_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();