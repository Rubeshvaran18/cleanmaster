
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  user_id?: string;
  customer_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  total_bookings: number;
  total_spent: number;
  registration_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      // Get all bookings with customer data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Get user profiles for registered customers
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Create a map to aggregate customer data
      const customerMap = new Map<string, Customer>();

      // Process bookings to aggregate customer data
      bookingsData?.forEach(booking => {
        const customerKey = booking.customer_email || booking.customer_name;
        const existing = customerMap.get(customerKey);

        if (existing) {
          existing.total_bookings += 1;
          existing.total_spent += Number(booking.total_amount || 0);
        } else {
          // Find matching profile
          const profile = profilesData?.find(p => 
            p.id === booking.user_id || 
            (p.first_name && p.last_name && 
             `${p.first_name} ${p.last_name}`.toLowerCase() === booking.customer_name.toLowerCase())
          );

          customerMap.set(customerKey, {
            id: booking.user_id || booking.id,
            user_id: booking.user_id || undefined,
            customer_name: booking.customer_name,
            email: booking.customer_email,
            phone_number: booking.customer_phone || profile?.phone_number || '',
            address: booking.address || '',
            total_bookings: 1,
            total_spent: Number(booking.total_amount || 0),
            registration_date: booking.booking_date,
            status: profile ? 'Registered' : 'Guest',
            created_at: booking.created_at,
            updated_at: booking.updated_at
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // For now, we'll add this as a booking since we don't have a direct customers table
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_name: customerData.customer_name,
          customer_email: customerData.email,
          customer_phone: customerData.phone_number,
          service_name: 'General Service',
          booking_date: new Date().toISOString().split('T')[0],
          booking_time: '09:00',
          address: customerData.address || '',
          total_amount: 0,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the customer list
      await fetchCustomers();
      return data;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      // Update bookings that match this customer
      const { error } = await supabase
        .from('bookings')
        .update({
          customer_name: updates.customer_name,
          customer_email: updates.email,
          customer_phone: updates.phone_number
        })
        .eq('customer_email', updates.email);

      if (error) throw error;

      // Update local state
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? { ...customer, ...updates } : customer
        )
      );
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    refetch: fetchCustomers,
    addCustomer,
    updateCustomer
  };
}
