import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Search, Star, MapPin, Phone, Mail, Calendar, IndianRupee, User, Download, CheckCircle } from 'lucide-react';
import { useExportData } from '@/hooks/useExportData';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomerForm } from './CustomerForm';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
  booking_date: string;
  email?: string;
  task_type: string;
  amount: number;
  discount_points: number;
  amount_paid: number;
  payment_status: string;
  source: string;
  task_done_by: string[];
  customer_notes?: string;
  customer_rating: string;
  task_completed?: boolean;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  name: string;
}

const RATING_COLORS = {
  'Good': 'bg-green-500',
  'Normal': 'bg-blue-500',
  'Bad': 'bg-orange-500',
  'Poor': 'bg-red-500'
};

export function CustomerManagement() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const { exportCustomerRecordsToExcel } = useExportData();
  const isMobile = useIsMobile();

  const [newCustomer, setNewCustomer] = useState<Partial<CustomerRecord>>({
    name: '',
    phone: '',
    address: '',
    booking_date: new Date().toISOString().split('T')[0],
    email: '',
    task_type: 'Domestic',
    amount: 0,
    discount_points: 0,
    amount_paid: 0,
    payment_status: 'Unpaid',
    source: '',
    task_done_by: [],
    customer_notes: '',
    customer_rating: 'Normal',
    task_completed: false
  });

  useEffect(() => {
    fetchCustomers();
    fetchEmployees();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch customers error:', error);
        throw error;
      }
      
      console.log('Fetched customers:', data);
      setCustomers((data as CustomerRecord[]) || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .eq('status', 'Active');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handlePaymentStatusUpdate = async (customerId: string, newStatus: string, amountPaid?: number) => {
    try {
      const updateData: any = {
        payment_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'Paid in Cash' && amountPaid !== undefined) {
        updateData.amount_paid = amountPaid;
      }

      const { error } = await supabase
        .from('customer_records')
        .update(updateData)
        .eq('id', customerId);

      if (error) throw error;

      toast.success('Payment status updated successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleTaskCompletion = async (customer: CustomerRecord) => {
    try {
      if (!customer.task_done_by || customer.task_done_by.length === 0) {
        toast.error('No employees assigned to this task');
        return;
      }

      // Calculate revenue per employee
      const employeeCount = customer.task_done_by.filter(emp => emp).length;
      const revenuePerEmployee = customer.amount / employeeCount;
      const today = new Date().toISOString().split('T')[0];

      // Update each employee's daily salary
      for (const employeeName of customer.task_done_by) {
        if (!employeeName) continue;

        // Find employee by name
        const employee = employees.find(emp => emp.name === employeeName);
        if (!employee) continue;

        // Check if daily salary record exists for today
        const { data: existingSalary, error: fetchError } = await supabase
          .from('daily_salary_records')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('date', today)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching daily salary:', fetchError);
          continue;
        }

        if (existingSalary) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('daily_salary_records')
            .update({
              total_amount: existingSalary.total_amount + revenuePerEmployee,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSalary.id);

          if (updateError) {
            console.error('Error updating daily salary:', updateError);
          }
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from('daily_salary_records')
            .insert({
              employee_id: employee.id,
              date: today,
              total_amount: revenuePerEmployee,
              notes: `Task completion revenue for customer: ${customer.name}`
            });

          if (insertError) {
            console.error('Error inserting daily salary:', insertError);
          }
        }
      }

      // Mark task as completed
      const { error } = await supabase
        .from('customer_records')
        .update({
          task_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast.success(`Task completed! Revenue of ₹${revenuePerEmployee.toFixed(2)} distributed to each of ${employeeCount} employees`);
      fetchCustomers();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleAddCustomer = async () => {
    try {
      console.log('=== STARTING ADD CUSTOMER ===');
      console.log('Raw newCustomer data:', newCustomer);
      
      // Enhanced validation
      if (!newCustomer.name?.trim()) {
        toast.error('Customer name is required');
        return;
      }
      
      if (!newCustomer.phone?.trim()) {
        toast.error('Phone number is required');
        return;
      }
      
      if (!newCustomer.address?.trim()) {
        toast.error('Address is required');
        return;
      }
      
      if (!newCustomer.booking_date) {
        toast.error('Booking date is required');
        return;
      }

      // Prepare the record with explicit field mapping
      const customerRecord = {
        name: String(newCustomer.name).trim(),
        phone: String(newCustomer.phone).trim(),
        address: String(newCustomer.address).trim(),
        booking_date: newCustomer.booking_date,
        email: newCustomer.email ? String(newCustomer.email).trim() : null,
        task_type: newCustomer.task_type || 'Domestic',
        source: newCustomer.source ? String(newCustomer.source).trim() : '',
        amount: Number(newCustomer.amount) || 0,
        discount_points: Number(newCustomer.discount_points) || 0,
        amount_paid: Number(newCustomer.amount_paid) || 0,
        payment_status: newCustomer.payment_status || 'Unpaid',
        task_done_by: Array.isArray(newCustomer.task_done_by) ? newCustomer.task_done_by : [],
        customer_notes: newCustomer.customer_notes ? String(newCustomer.customer_notes).trim() : null,
        customer_rating: newCustomer.customer_rating || 'Normal',
        task_completed: Boolean(newCustomer.task_completed) || false
      };
      
      console.log('Processed customer record for insert:', customerRecord);
      console.log('Field types check:', {
        name: typeof customerRecord.name,
        phone: typeof customerRecord.phone,
        address: typeof customerRecord.address,
        booking_date: typeof customerRecord.booking_date,
        email: typeof customerRecord.email,
        task_type: typeof customerRecord.task_type,
        source: typeof customerRecord.source,
        amount: typeof customerRecord.amount,
        discount_points: typeof customerRecord.discount_points,
        amount_paid: typeof customerRecord.amount_paid,
        payment_status: typeof customerRecord.payment_status,
        task_done_by: Array.isArray(customerRecord.task_done_by),
        customer_notes: typeof customerRecord.customer_notes,
        customer_rating: typeof customerRecord.customer_rating,
        task_completed: typeof customerRecord.task_completed
      });

      const { data, error } = await supabase
        .from('customer_records')
        .insert(customerRecord)
        .select()
        .single();

      if (error) {
        console.error('=== SUPABASE INSERT ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Full error object:', error);
        throw error;
      }
      
      console.log('=== CUSTOMER ADDED SUCCESSFULLY ===');
      console.log('Inserted data:', data);
      
      toast.success('Customer record added successfully');
      setIsAddingCustomer(false);
      resetNewCustomer();
      fetchCustomers();
      
    } catch (error: any) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to add customer record';
      
      if (error.code === '23505') {
        errorMessage = 'A customer with this information already exists';
      } else if (error.code === '23514') {
        errorMessage = 'Invalid data format. Please check your inputs';
      } else if (error.code === '23502') {
        errorMessage = 'Required field is missing. Please fill all required fields';
      } else if (error.message) {
        errorMessage = `Database error: ${error.message}`;
      }
      
      console.error('Final error message:', errorMessage);
      toast.error(errorMessage);
    }
  };

  const resetNewCustomer = useCallback(() => {
    setNewCustomer({
      name: '',
      phone: '',
      address: '',
      booking_date: new Date().toISOString().split('T')[0],
      email: '',
      task_type: 'Domestic',
      amount: 0,
      discount_points: 0,
      amount_paid: 0,
      payment_status: 'Unpaid',
      source: '',
      task_done_by: [],
      customer_notes: '',
      customer_rating: 'Normal',
      task_completed: false
    });
  }, []);

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    try {
      console.log('Updating customer with data:', editingCustomer);
      
      if (!editingCustomer.name || !editingCustomer.phone || !editingCustomer.address || !editingCustomer.booking_date) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('customer_records')
        .update({
          name: editingCustomer.name.trim(),
          phone: editingCustomer.phone.trim(),
          address: editingCustomer.address.trim(),
          booking_date: editingCustomer.booking_date,
          email: editingCustomer.email?.trim() || null,
          task_type: editingCustomer.task_type,
          source: editingCustomer.source?.trim() || '',
          amount: Number(editingCustomer.amount) || 0,
          discount_points: Number(editingCustomer.discount_points) || 0,
          amount_paid: Number(editingCustomer.amount_paid) || 0,
          payment_status: editingCustomer.payment_status,
          task_done_by: editingCustomer.task_done_by || [],
          customer_notes: editingCustomer.customer_notes?.trim() || null,
          customer_rating: editingCustomer.customer_rating,
          task_completed: editingCustomer.task_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCustomer.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      toast.success('Customer record updated successfully');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      if (error.message) {
        toast.error(`Failed to update customer: ${error.message}`);
      } else {
        toast.error('Failed to update customer record');
      }
    }
  };

  const handleEditCustomer = (customer: CustomerRecord) => {
    setEditingCustomer({ ...customer });
  };

  const handleEditingCustomerDataChange = (data: Partial<CustomerRecord>) => {
    if (editingCustomer) {
      setEditingCustomer({ ...editingCustomer, ...data });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.task_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-4 md:p-6">Loading customers...</div>;
  }

  const CustomerCard = ({ customer }: { customer: CustomerRecord }) => (
    <Card key={customer.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Customer Info */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                <span className="break-words">{customer.address}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span className="break-all">{customer.email}</span>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{new Date(customer.booking_date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={customer.task_type === 'Corporate' ? 'default' : 'secondary'}>
                {customer.task_type}
              </Badge>
              {customer.source && (
                <Badge variant="outline">{customer.source}</Badge>
              )}
            </div>
          </div>

          {/* Financial Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                <span className="font-medium">₹{customer.amount}</span>
              </div>
              {customer.discount_points > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Star className="h-3 w-3" />
                  <span className="text-sm">-{customer.discount_points} pts</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Select 
                value={customer.payment_status} 
                onValueChange={(value) => {
                  if (value === 'Paid in Cash') {
                    const amount = prompt('Enter paid amount:');
                    if (amount && !isNaN(Number(amount))) {
                      handlePaymentStatusUpdate(customer.id, value, Number(amount));
                    }
                  } else {
                    handlePaymentStatusUpdate(customer.id, value);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Paid in Cash">Paid in Cash</SelectItem>
                </SelectContent>
              </Select>
              {customer.payment_status === 'Paid in Cash' && (
                <div className="text-sm text-green-600">Paid: ₹{customer.amount_paid}</div>
              )}
            </div>
          </div>

          {/* Task Assignment */}
          <div>
            <div className="text-sm font-medium mb-2">Assigned to:</div>
            {customer.task_done_by && customer.task_done_by.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {customer.task_done_by.map((assignee, index) => (
                  assignee && (
                    <Badge key={index} variant="outline" className="text-xs">
                      {assignee}
                    </Badge>
                  )
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Not assigned</div>
            )}
          </div>

          {/* Status & Rating */}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className={RATING_COLORS[customer.customer_rating]}>
              {customer.customer_rating}
            </Badge>
            {customer.task_completed ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              customer.task_done_by && customer.task_done_by.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTaskCompletion(customer)}
                >
                  Mark Complete
                </Button>
              )
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <Dialog open={editingCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditingCustomer(null)}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditCustomer(customer)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Customer Record</DialogTitle>
                </DialogHeader>
                {editingCustomer && (
                  <CustomerForm
                    customerData={editingCustomer}
                    setCustomerData={handleEditingCustomerDataChange}
                    onSave={handleUpdateCustomer}
                    isEditing={true}
                    employees={employees}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Customer Management</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportCustomerRecordsToExcel(customers)}
            className="flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
          <DialogTrigger asChild>
            <Button className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer Record</DialogTitle>
            </DialogHeader>
            <CustomerForm
              customerData={newCustomer}
              setCustomerData={setNewCustomer}
              onSave={handleAddCustomer}
              employees={employees}
            />
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customer records found
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Info</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Financial</TableHead>
                    <TableHead>Task Assignment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate max-w-32">{customer.address || 'Not provided'}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone || 'Not provided'}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-32">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(customer.booking_date).toLocaleDateString()}</span>
                          </div>
                          <Badge variant={customer.task_type === 'Corporate' ? 'default' : 'secondary'}>
                            {customer.task_type}
                          </Badge>
                          {customer.source && (
                            <div className="text-xs text-muted-foreground">Source: {customer.source}</div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-sm">
                            <IndianRupee className="h-3 w-3" />
                            <span>{customer.amount || 0}</span>
                          </div>
                          {customer.discount_points > 0 && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Star className="h-3 w-3" />
                              <span>-{customer.discount_points} pts</span>
                            </div>
                          )}
                          <div className="space-y-1">
                            <Select 
                              value={customer.payment_status} 
                              onValueChange={(value) => {
                                if (value === 'Paid in Cash') {
                                  const amount = prompt('Enter paid amount:');
                                  if (amount && !isNaN(Number(amount))) {
                                    handlePaymentStatusUpdate(customer.id, value, Number(amount));
                                  }
                                } else {
                                  handlePaymentStatusUpdate(customer.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-32 h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Partial">Partial</SelectItem>
                                <SelectItem value="Paid in Cash">Paid in Cash</SelectItem>
                              </SelectContent>
                            </Select>
                            {customer.payment_status === 'Paid in Cash' && (
                              <div className="text-xs text-green-600">₹{customer.amount_paid}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {customer.task_done_by && customer.task_done_by.length > 0 ? (
                            customer.task_done_by.map((assignee, index) => (
                              assignee && (
                                <div key={index} className="text-xs px-2 py-1 bg-muted rounded">
                                  {assignee}
                                </div>
                              )
                            ))
                          ) : (
                            <div className="text-xs text-muted-foreground">Not assigned</div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={RATING_COLORS[customer.customer_rating]}>
                            {customer.customer_rating}
                          </Badge>
                          {customer.task_completed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            customer.task_done_by && customer.task_done_by.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-6"
                                onClick={() => handleTaskCompletion(customer)}
                              >
                                Mark Complete
                              </Button>
                            )
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Dialog open={editingCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Customer Record</DialogTitle>
                            </DialogHeader>
                            {editingCustomer && (
                              <CustomerForm
                                customerData={editingCustomer}
                                setCustomerData={handleEditingCustomerDataChange}
                                onSave={handleUpdateCustomer}
                                isEditing={true}
                                employees={employees}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customer records found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
