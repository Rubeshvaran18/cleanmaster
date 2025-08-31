
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CustomerData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_bookings: number;
  total_spent: number;
  last_booking_date: string;
  status: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  total_points: number;
}

export function useCustomerData() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customer data...');
      
      // Get all bookings with customer data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Bookings error:', bookingsError);
        throw bookingsError;
      }

      console.log('Bookings data:', bookingsData);

      // Get user profiles for registered customers
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        // Don't throw here, profiles might be empty
      }

      console.log('Profiles data:', profilesData);

      // Get customer points - handle the error more gracefully
      let pointsData = [];
      try {
        const { data: points, error: pointsError } = await supabase
          .from('customer_points')
          .select('user_id, total_points');

        if (pointsError) {
          console.error('Points error:', pointsError);
          // If there's an error, we'll just set points to 0 for all customers
        } else {
          pointsData = points || [];
        }
      } catch (error) {
        console.error('Error fetching points:', error);
        // Continue without points data
      }

      console.log('Points data:', pointsData);

      // Create a map to aggregate customer data
      const customerMap = new Map<string, CustomerData>();

      // Process bookings to aggregate customer data
      if (bookingsData && bookingsData.length > 0) {
        bookingsData.forEach(booking => {
          const customerKey = booking.customer_email || booking.customer_name || booking.id;
          const existing = customerMap.get(customerKey);

          if (existing) {
            existing.total_bookings += 1;
            existing.total_spent += Number(booking.total_amount || 0);
            if (new Date(booking.booking_date) > new Date(existing.last_booking_date)) {
              existing.last_booking_date = booking.booking_date;
            }
          } else {
            // Find matching profile
            const profile = profilesData?.find(p => 
              p.id === booking.user_id || 
              (p.first_name && p.last_name && 
               `${p.first_name} ${p.last_name}`.toLowerCase() === booking.customer_name?.toLowerCase())
            );

            // Find points for this customer
            const customerPoints = pointsData.find(p => p.user_id === booking.user_id);

            customerMap.set(customerKey, {
              id: booking.user_id || booking.id,
              customer_name: booking.customer_name || 'Unknown Customer',
              customer_email: booking.customer_email || '',
              customer_phone: booking.customer_phone || profile?.phone_number || '',
              total_bookings: 1,
              total_spent: Number(booking.total_amount || 0),
              last_booking_date: booking.booking_date,
              status: profile ? 'Registered' : 'Guest',
              first_name: profile?.first_name || '',
              last_name: profile?.last_name || '',
              created_at: booking.created_at,
              total_points: customerPoints?.total_points || 0
            });
          }
        });
      }

      const customersArray = Array.from(customerMap.values());
      console.log('Final customers array:', customersArray);
      setCustomers(customersArray);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    refetch: fetchCustomers
  };
}
