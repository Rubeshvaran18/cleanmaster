
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  totalEmployees: number;
  fullTimeEmployees: number;
  partTimeEmployees: number;
  activeBookings: number;
  monthlyRevenue: number;
  todaysFollowUps: number;
  repeatedCustomers: number;
  totalCustomers: number;
  domesticCustomers: number;
  corporateCustomers: number;
  customerSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  followUpCustomers: Array<{
    id: string;
    customer_name: string;
    mobile_number: string;
    customer_type: string;
    follow_up_date: string;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'employee' | 'booking' | 'task';
    title: string;
    description: string;
    date: string;
  }>;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    fullTimeEmployees: 0,
    partTimeEmployees: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    todaysFollowUps: 0,
    repeatedCustomers: 0,
    totalCustomers: 0,
    domesticCustomers: 0,
    corporateCustomers: 0,
    customerSources: [],
    followUpCustomers: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total employees
        const { data: employees } = await supabase
          .from('employees')
          .select('*')
          .eq('status', 'Active');

        // Calculate part-time and full-time counts
        const fullTimeCount = employees?.filter(emp => (emp as any).employment_type === 'full-time').length || 0;
        const partTimeCount = employees?.filter(emp => (emp as any).employment_type === 'part-time').length || 0;

        // Fetch active bookings (Pending and In Progress)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .in('status', ['Pending', 'In Progress']);

        // Fetch all bookings for revenue calculation (current month)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const { data: monthlyBookings } = await supabase
          .from('bookings')
          .select('total_amount, status')
          .gte('created_at', `${currentMonth}-01`)
          .lt('created_at', `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)}`);

        // Calculate monthly revenue from completed bookings only
        const monthlyRevenue = monthlyBookings?.reduce((sum, booking) => 
          booking.status === 'Completed' ? sum + (booking.total_amount || 0) : sum, 0) || 0;

        // Fetch customer records for more accurate revenue calculation
        const { data: customerRecords } = await supabase
          .from('customer_records')
          .select('amount_paid, created_at, source')
          .gte('created_at', `${currentMonth}-01`)
          .lt('created_at', `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10)}`);

        // Add customer records revenue to monthly revenue
        const customerRecordsRevenue = customerRecords?.reduce((sum, record) => 
          sum + (record.amount_paid || 0), 0) || 0;

        const totalMonthlyRevenue = monthlyRevenue + customerRecordsRevenue;

        // Fetch all unique customers from bookings and customer records
        const { data: allBookings } = await supabase
          .from('bookings')
          .select('customer_email, customer_name, created_at');

        const { data: allCustomerRecords } = await supabase
          .from('customer_records')
          .select('email, name, created_at, source, task_type');

        // Create unique customer set
        const uniqueCustomers = new Set<string>();

        // Process bookings
        allBookings?.forEach(booking => {
          const customerKey = booking.customer_email || booking.customer_name;
          if (customerKey) {
            uniqueCustomers.add(customerKey);
          }
        });

        // Process customer records
        allCustomerRecords?.forEach(record => {
          const customerKey = record.email || record.name;
          if (customerKey) {
            uniqueCustomers.add(customerKey);
          }
        });

        const totalCustomers = uniqueCustomers.size;

        // Calculate domestic and corporate customers from customer records
        const domesticCustomers = allCustomerRecords?.filter(record => record.task_type === 'Domestic').length || 0;
        const corporateCustomers = allCustomerRecords?.filter(record => record.task_type === 'Corporate').length || 0;

        // Calculate customer sources breakdown
        const sourceCounts: { [key: string]: number } = {};
        allCustomerRecords?.forEach(record => {
          const source = record.source || 'Not Specified';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        const customerSources = Object.entries(sourceCounts).map(([source, count]) => ({
          source,
          count,
          percentage: totalCustomers > 0 ? (count / totalCustomers) * 100 : 0
        })).sort((a, b) => b.count - a.count);

        // Calculate repeated customers (customers with 2+ bookings in the past year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const { data: yearlyBookings } = await supabase
          .from('bookings')
          .select('customer_email, customer_name, created_at')
          .gte('created_at', oneYearAgo.toISOString());

        // Group bookings by customer and count
        const customerBookingCounts: { [key: string]: number } = {};
        yearlyBookings?.forEach(booking => {
          const customerKey = booking.customer_email || booking.customer_name;
          if (customerKey) {
            customerBookingCounts[customerKey] = (customerBookingCounts[customerKey] || 0) + 1;
          }
        });

        // Count customers with 2+ bookings
        const repeatedCustomersCount = Object.values(customerBookingCounts).filter(count => count >= 2).length;

        // Fetch recent activities
        const recentActivities = [];

        // Recent employees (last 3)
        const { data: recentEmployees } = await supabase
          .from('employees')
          .select('name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        recentEmployees?.forEach(emp => {
          recentActivities.push({
            id: `emp-${emp.name}`,
            type: 'employee' as const,
            title: 'New employee onboarded',
            description: `${emp.name} joined the team`,
            date: emp.created_at
          });
        });

        // Recent bookings (last 3)
        const { data: recentBookings } = await supabase
          .from('bookings')
          .select('customer_name, service_name, created_at, status')
          .order('created_at', { ascending: false })
          .limit(3);

        recentBookings?.forEach(booking => {
          recentActivities.push({
            id: `booking-${booking.customer_name}`,
            type: 'booking' as const,
            title: 'New booking received',
            description: `${booking.service_name} for ${booking.customer_name}`,
            date: booking.created_at
          });
        });

        // Fetch potential customers with today's follow-ups
        const today = new Date().toISOString().split('T')[0];
        const { data: todaysFollowUps } = await supabase
          .from('potential_customers')
          .select('*')
          .eq('follow_up_date', today);

        // Fetch all upcoming follow-ups (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const { data: upcomingFollowUps } = await supabase
          .from('potential_customers')
          .select('*')
          .gte('follow_up_date', today)
          .lte('follow_up_date', nextWeek.toISOString().split('T')[0])
          .order('follow_up_date', { ascending: true })
          .limit(10);

        const followUpCustomers = upcomingFollowUps?.map(customer => ({
          id: customer.id,
          customer_name: customer.customer_name,
          mobile_number: customer.mobile_number,
          customer_type: (customer as any).customer_type || 'regular',
          follow_up_date: customer.follow_up_date
        })) || [];

        // Add today's follow-ups to recent activities
        todaysFollowUps?.forEach(customer => {
          recentActivities.push({
            id: `followup-${customer.id}`,
            type: 'task' as const,
            title: 'Follow-up scheduled',
            description: `Follow up with ${customer.customer_name} (${(customer as any).customer_type || 'regular'})`,
            date: customer.follow_up_date || new Date().toISOString()
          });
        });

        // Sort recent activities by date
        recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData({
          totalEmployees: employees?.length || 0,
          fullTimeEmployees: fullTimeCount,
          partTimeEmployees: partTimeCount,
          activeBookings: bookings?.length || 0,
          monthlyRevenue: totalMonthlyRevenue,
          todaysFollowUps: todaysFollowUps?.length || 0,
          repeatedCustomers: repeatedCustomersCount,
          totalCustomers: totalCustomers,
          domesticCustomers: domesticCustomers,
          corporateCustomers: corporateCustomers,
          customerSources: customerSources,
          followUpCustomers: followUpCustomers,
          recentActivities: recentActivities.slice(0, 5)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading };
};
