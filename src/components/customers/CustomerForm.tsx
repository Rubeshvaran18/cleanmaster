import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface CustomerRecord {
  id?: string;
  name: string;
  phone: string;
  address: string;
  booking_date: string;
  email?: string;
  task_type: string;
  amount: number;
  discount_points?: number;
  amount_paid: number;
  payment_status: string;
  source: string;
  task_done_by: string[];
  customer_notes?: string;
  customer_rating: string;
  created_at?: string;
  updated_at?: string;
}

interface Employee {
  id: string;
  name: string;
}

interface CustomerFormProps {
  customerData: Partial<CustomerRecord>;
  setCustomerData: (data: Partial<CustomerRecord>) => void;
  onSave: () => void;
  isEditing?: boolean;
  employees: Employee[];
}

const sourceOptions = [
  'Google',
  'Direct Referral',
  'Company Vehicle',
  'Others'
];

export function CustomerForm({ customerData, setCustomerData, onSave, isEditing = false, employees }: CustomerFormProps) {
  const addEmployee = (employeeName: string) => {
    if (!employeeName || customerData.task_done_by?.includes(employeeName)) return;
    
    const updatedTaskDoneBy = [...(customerData.task_done_by || []), employeeName];
    setCustomerData({ ...customerData, task_done_by: updatedTaskDoneBy });
  };

  const removeEmployee = (employeeName: string) => {
    const updatedTaskDoneBy = customerData.task_done_by?.filter(name => name !== employeeName) || [];
    setCustomerData({ ...customerData, task_done_by: updatedTaskDoneBy });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={customerData.name || ''}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              placeholder="Enter customer name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={customerData.phone || ''}
              onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={customerData.email || ''}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="booking_date">Booking Date *</Label>
            <Input
              id="booking_date"
              type="date"
              value={customerData.booking_date || ''}
              onChange={(e) => setCustomerData({ ...customerData, booking_date: e.target.value })}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={customerData.address || ''}
              onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
              placeholder="Enter customer address"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="task_type">Task Type</Label>
            <Select
              value={customerData.task_type || 'Domestic'}
              onValueChange={(value: string) => setCustomerData({ ...customerData, task_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Domestic">Domestic</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="source">Source</Label>
            <Select
              value={customerData.source || ''}
              onValueChange={(value) => setCustomerData({ ...customerData, source: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="customer_rating">Customer Rating</Label>
            <Select
              value={customerData.customer_rating || 'Normal'}
              onValueChange={(value: string) => setCustomerData({ ...customerData, customer_rating: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Bad">Bad</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="amount">Total Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={customerData.amount || 0}
              onChange={(e) => setCustomerData({ ...customerData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="discount_points">Discount Points (Optional)</Label>
            <Input
              id="discount_points"
              type="number"
              value={customerData.discount_points || ''}
              onChange={(e) => setCustomerData({ 
                ...customerData, 
                discount_points: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="amount_paid">Amount Paid (₹)</Label>
            <Input
              id="amount_paid"
              type="number"
              value={customerData.amount_paid || 0}
              onChange={(e) => setCustomerData({ ...customerData, amount_paid: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          
          <div className="md:col-span-3">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={customerData.payment_status || 'Unpaid'}
              onValueChange={(value: string) => setCustomerData({ ...customerData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid in Cash">Paid in Cash</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Assign Employees</Label>
            <Select onValueChange={(value) => addEmployee(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee to assign" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  .filter(emp => !customerData.task_done_by?.includes(emp.name))
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.name}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          {customerData.task_done_by && customerData.task_done_by.length > 0 && (
            <div>
              <Label>Assigned Employees</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {customerData.task_done_by.map((employeeName, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {employeeName}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeEmployee(employeeName)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="customer_notes">Customer Notes</Label>
            <Textarea
              id="customer_notes"
              value={customerData.customer_notes || ''}
              onChange={(e) => setCustomerData({ ...customerData, customer_notes: e.target.value })}
              placeholder="Enter any additional notes about the customer or job"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} className="w-full md:w-auto">
          {isEditing ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </div>
  );
}
