
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  email_verified: boolean | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
  userProfile?: UserProfile | null;
  preSelectedServiceId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  open, 
  onClose, 
  onBookingComplete,
  userProfile,
  preSelectedServiceId
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill form when userProfile is available
  React.useEffect(() => {
    if (userProfile && open) {
      const fullName = userProfile.first_name && userProfile.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : userProfile.first_name || '';
      
      setCustomerName(fullName);
      setCustomerEmail(user?.email || '');
      setCustomerPhone(userProfile.phone_number || '');
    } else if (user && open) {
      // Fallback to user email if no profile
      setCustomerEmail(user.email || '');
    }
  }, [userProfile, user, open]);

  // Set pre-selected service when modal opens
  React.useEffect(() => {
    if (preSelectedServiceId && open) {
      setSelectedService(preSelectedServiceId);
    }
  }, [preSelectedServiceId, open]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedService('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setAddress('');
      setNotes('');
    }
  }, [open]);

  // Fetch available services with consistent status filter
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services', 'booking'],
    queryFn: async () => {
      console.log('BookingModal: Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'Active')
        .order('name');

      if (error) {
        console.error('BookingModal: Error fetching services:', error);
        throw error;
      }
      console.log('BookingModal: Services fetched:', data);
      return data || [];
    },
    enabled: open,
  });

  // Time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedService || !customerName || !customerEmail || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      const bookingData = {
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime,
        service_id: selectedService,
        service_name: selectedServiceData?.name || 'Unknown Service',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        address: address,
        notes: notes,
        total_amount: selectedServiceData?.price || 0,
        user_id: user?.id || null,
        status: 'Pending'
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast.success('Booking created successfully!');
      onBookingComplete();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error state if services failed to load
  if (servicesError) {
    console.error('BookingModal: Services error:', servicesError);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Service</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            {servicesLoading ? (
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            ) : servicesError ? (
              <div className="text-red-500 text-sm">Error loading services. Please try again.</div>
            ) : (
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ₹{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Your phone number"
                type="tel"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Service Address *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter the complete address where service is required"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or requirements"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || servicesLoading}>
              {isSubmitting ? 'Creating Booking...' : 'Book Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
