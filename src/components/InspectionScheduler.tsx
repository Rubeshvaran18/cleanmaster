
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface InspectionSchedulerProps {
  booking: {
    id: string;
    customer_name: string;
    customer_phone?: string;
    address: string;
    booking_date: string;
    service_name: string;
  };
  open: boolean;
  onClose: () => void;
  onInspectionScheduled?: () => void;
}

export const InspectionScheduler = ({ 
  booking, 
  open, 
  onClose, 
  onInspectionScheduled 
}: InspectionSchedulerProps) => {
  const [loading, setLoading] = useState(false);

  const scheduleInspection = async () => {
    setLoading(true);
    try {
      // Create customer record with inspection flag
      const customerRecordData = {
        name: booking.customer_name,
        phone: booking.customer_phone || '',
        address: booking.address,
        booking_date: booking.booking_date,
        email: '', // Will be filled if available
        task_type: 'Inspection' as const,
        source: 'Booking Inspection',
        amount: 0,
        discount_points: 0,
        amount_paid: 0,
        payment_status: 'N/A' as const,
        task_done_by: [],
        customer_notes: `Inspection scheduled for ${booking.service_name} - Booking ID: ${booking.id}`,
        customer_rating: 'Normal' as const
      };

      const { error } = await supabase
        .from('customer_records')
        .insert(customerRecordData);

      if (error) throw error;

      // Store inspection data in localStorage as well for the inspection management page
      const inspectionData = {
        id: Date.now().toString(),
        booking_id: booking.id,
        customer_name: booking.customer_name,
        address: booking.address,
        phone_number: booking.customer_phone || '',
        service_name: booking.service_name,
        scheduled_date: booking.booking_date,
        status: 'Scheduled',
        created_from_booking: true,
        created_at: new Date().toISOString()
      };

      const existingInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      existingInspections.push(inspectionData);
      localStorage.setItem('inspections', JSON.stringify(existingInspections));

      toast.success('Inspection scheduled successfully!');
      onInspectionScheduled?.();
      onClose();
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      toast.error('Failed to schedule inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Inspection</DialogTitle>
          <DialogDescription>
            Schedule an inspection for this booking
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Customer Information</h3>
            <p><strong>Name:</strong> {booking.customer_name}</p>
            <p><strong>Phone:</strong> {booking.customer_phone || 'Not provided'}</p>
            <p><strong>Address:</strong> {booking.address}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Service Details</h3>
            <p><strong>Service:</strong> {booking.service_name}</p>
            <p><strong>Booking Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Inspection will be scheduled for the same date as booking</span>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={scheduleInspection} disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Inspection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
