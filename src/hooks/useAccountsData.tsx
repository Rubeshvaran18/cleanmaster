
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AccountsData {
  totalRevenue: number;
  totalBookings: number;
  totalStockValue: number;
  totalVendorPayments: number;
  totalSubContractorPayments: number;
  totalSalaryExpenses: number;
  totalManagerRevenue: number;
  totalManagerExpenses: number;
  totalTaskRevenue: number;
  totalCompletedTasks: number;
  overdue: number;
  totalCustomerRecordsRevenue: number;
  totalCustomerRecordsPaid: number;
}

export const useAccountsData = (selectedMonth: string) => {
  const [accountsData, setAccountsData] = useState<AccountsData>({
    totalRevenue: 0,
    totalBookings: 0,
    totalStockValue: 0,
    totalVendorPayments: 0,
    totalSubContractorPayments: 0,
    totalSalaryExpenses: 0,
    totalManagerRevenue: 0,
    totalManagerExpenses: 0,
    totalTaskRevenue: 0,
    totalCompletedTasks: 0,
    overdue: 0,
    totalCustomerRecordsRevenue: 0,
    totalCustomerRecordsPaid: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountsData = async () => {
      setLoading(true);
      try {
        // Get start and end dates for the selected month
        const startDate = `${selectedMonth}-01`;
        const endDate = new Date(selectedMonth + '-01');
        endDate.setMonth(endDate.getMonth() + 1);
        const endDateString = endDate.toISOString().slice(0, 10);

        // Fetch bookings data for revenue calculation
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('total_amount, status')
          .gte('created_at', startDate)
          .lt('created_at', endDateString);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        }

        // Calculate revenue and booking counts
        const totalRevenue = bookings?.reduce((sum, booking) => 
          sum + (booking.total_amount || 0), 0) || 0;
        
        const totalBookings = bookings?.length || 0;

        // Fetch customer records for additional revenue calculation
        const { data: customerRecords, error: customerRecordsError } = await supabase
          .from('customer_records')
          .select('amount, amount_paid, payment_status')
          .gte('created_at', startDate)
          .lt('created_at', endDateString);

        if (customerRecordsError) {
          console.error('Error fetching customer records:', customerRecordsError);
        }

        const totalCustomerRecordsRevenue = customerRecords?.reduce((sum, record) => 
          sum + (record.amount || 0), 0) || 0;
        
        const totalCustomerRecordsPaid = customerRecords?.reduce((sum, record) => 
          sum + (record.amount_paid || 0), 0) || 0;

        // Fetch stock data for total value calculation
        const { data: stocks, error: stocksError } = await supabase
          .from('stocks')
          .select('total_value');

        if (stocksError) {
          console.error('Error fetching stocks:', stocksError);
        }

        const totalStockValue = stocks?.reduce((sum, stock) => 
          sum + (stock.total_value || 0), 0) || 0;

        // For vendors and sub-contractors, we'll simulate payment data
        // In a real application, you would have payment tracking tables
        const { data: vendors, error: vendorsError } = await supabase
          .from('vendors')
          .select('*');

        const { data: subContractors, error: subContractorsError } = await supabase
          .from('sub_contractors')
          .select('hourly_rate');

        if (vendorsError) {
          console.error('Error fetching vendors:', vendorsError);
        }

        if (subContractorsError) {
          console.error('Error fetching sub contractors:', subContractorsError);
        }

        // Fetch daily salary records for the month
        const { data: dailySalaryRecords, error: salaryError } = await supabase
          .from('daily_salary_records')
          .select('total_amount')
          .gte('date', startDate)
          .lt('date', endDateString);

        if (salaryError) {
          console.error('Error fetching daily salary records:', salaryError);
        }

        const totalSalaryExpenses = dailySalaryRecords?.reduce((sum, record) => 
          sum + (record.total_amount || 0), 0) || 0;

        // Fetch manager revenue data
        const { data: managerRevenues, error: managerError } = await supabase
          .from('manager_revenue')
          .select('*')
          .gte('date', startDate)
          .lt('date', endDateString);

        if (managerError) {
          console.error('Error fetching manager revenues:', managerError);
        }

        const totalManagerRevenue = managerRevenues?.reduce((sum, record) => 
          sum + (record.revenue_generated || 0), 0) || 0;
        const totalManagerExpenses = managerRevenues?.reduce((sum, record) => 
          sum + (record.expenses || 0), 0) || 0;

        // Simulate vendor and subcontractor payments based on actual data
        const totalVendorPayments = (vendors?.length || 0) * 5000; // Example calculation
        const totalSubContractorPayments = subContractors?.reduce((sum, contractor) => 
          sum + ((contractor.hourly_rate || 0) * 40), 0) || 0; // Assuming 40 hours per month

        // Calculate overdue amounts from both bookings and customer records
        const overdueBookings = bookings?.filter(booking => 
          booking.status === 'Pending' && booking.total_amount) || [];
        const bookingOverdue = overdueBookings.reduce((sum, booking) => 
          sum + (booking.total_amount || 0), 0) * 0.1; // 10% of pending bookings

        const unpaidCustomerRecords = customerRecords?.filter(record => 
          record.payment_status === 'Not yet paid') || [];
        const customerRecordOverdue = unpaidCustomerRecords.reduce((sum, record) => 
          sum + (record.amount || 0), 0);

        const overdue = bookingOverdue + customerRecordOverdue;

        // Calculate task revenue from completed tasks
        const { data: completedTasks, error: tasksError } = await supabase
          .from('task_assignments')
          .select(`
            *,
            bookings!inner(total_amount, revenue_processed)
          `)
          .eq('status', 'Completed');

        if (tasksError) {
          console.error('Error fetching completed tasks:', tasksError);
        }

        const taskRevenue = completedTasks?.reduce((sum, task) => 
          sum + (task.bookings?.total_amount || 0), 0) || 0;
        const completedTasksCount = completedTasks?.length || 0;

        setAccountsData({
          totalRevenue,
          totalBookings,
          totalStockValue,
          totalVendorPayments,
          totalSubContractorPayments,
          totalSalaryExpenses,
          totalManagerRevenue,
          totalManagerExpenses,
          totalTaskRevenue: taskRevenue,
          totalCompletedTasks: completedTasksCount,
          overdue,
          totalCustomerRecordsRevenue,
          totalCustomerRecordsPaid
        });
      } catch (error) {
        console.error('Error fetching accounts data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsData();
  }, [selectedMonth]);

  return { accountsData, loading };
};
