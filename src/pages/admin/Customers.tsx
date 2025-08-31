import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Star, Calendar, Phone, Mail, Edit, Save, X, UserPlus, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useExportData } from '@/hooks/useExportData';
import { useIsMobile } from '@/hooks/use-mobile';

interface PotentialCustomer {
  id?: string;
  customer_name: string;
  mobile_number: string;
  follow_up_date: string | null;
  customer_type?: 'royal' | 'elite' | 'normal';
}

export default function Customers() {
  const { customers, loading, refetch } = useCustomerData();
  const { exportCustomersToExcel, exportCustomersToPDF } = useExportData();
  const isMobile = useIsMobile();
  const [potentialCustomers, setPotentialCustomers] = useState<PotentialCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [editingPotential, setEditingPotential] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [isAddingPotential, setIsAddingPotential] = useState(false);
  const [newPotentialCustomer, setNewPotentialCustomer] = useState<PotentialCustomer>({
    customer_name: '',
    mobile_number: '',
    follow_up_date: null,
    customer_type: 'normal'
  });

  // Edit customer form state
  const [editCustomerData, setEditCustomerData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });

  useEffect(() => {
    fetchPotentialCustomers();
  }, []);

  const fetchPotentialCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('potential_customers')
        .select('*')
        .order('follow_up_date', { ascending: true });
      
      if (error) throw error;
      
      // Sort to show today's follow-ups first
      const today = new Date().toISOString().split('T')[0];
      const sorted = (data || []).sort((a, b) => {
        const isAToday = a.follow_up_date === today;
        const isBToday = b.follow_up_date === today;
        
        if (isAToday && !isBToday) return -1;
        if (!isAToday && isBToday) return 1;
        
        if (!a.follow_up_date && !b.follow_up_date) return 0;
        if (!a.follow_up_date) return 1;
        if (!b.follow_up_date) return -1;
        
        return new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime();
      });
      
      setPotentialCustomers(sorted as PotentialCustomer[]);
    } catch (error) {
      console.error('Error fetching potential customers:', error);
    }
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer.id);
    setEditCustomerData({
      customer_name: customer.customer_name,
      customer_email: customer.customer_email,
      customer_phone: customer.customer_phone || ''
    });
  };

  const handleSaveCustomer = async (customerId: string) => {
    try {
      // Update all bookings for this customer
      const { error } = await supabase
        .from('bookings')
        .update({
          customer_name: editCustomerData.customer_name,
          customer_email: editCustomerData.customer_email,
          customer_phone: editCustomerData.customer_phone
        })
        .eq('customer_email', customers.find(c => c.id === customerId)?.customer_email);

      if (error) throw error;

      toast.success('Customer information updated successfully');
      setEditingCustomer(null);
      refetch();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer information');
    }
  };

  const handleAddToPotential = async (customer: any) => {
    try {
      const { error } = await supabase
        .from('potential_customers')
        .insert({
          customer_name: customer.customer_name,
          mobile_number: customer.customer_phone || '',
          follow_up_date: followUpDate || null,
          customer_type: 'normal'
        });

      if (error) throw error;
      
      toast.success('Customer added to potential follow-ups');
      setEditingCustomer(null);
      setFollowUpDate('');
      fetchPotentialCustomers();
    } catch (error) {
      console.error('Error adding to potential customers:', error);
      toast.error('Failed to add customer to follow-ups');
    }
  };

  const handleAddNewPotential = async () => {
    try {
      const { error } = await supabase
        .from('potential_customers')
        .insert(newPotentialCustomer);

      if (error) throw error;
      
      toast.success('New potential customer added');
      setIsAddingPotential(false);
      setNewPotentialCustomer({
        customer_name: '',
        mobile_number: '',
        follow_up_date: null,
        customer_type: 'normal'
      });
      fetchPotentialCustomers();
    } catch (error) {
      console.error('Error adding potential customer:', error);
      toast.error('Failed to add potential customer');
    }
  };

  const handleUpdatePotentialCustomer = async (id: string, updates: Partial<PotentialCustomer>) => {
    try {
      const { error } = await supabase
        .from('potential_customers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Follow-up date updated');
      setEditingPotential(null);
      fetchPotentialCustomers();
    } catch (error) {
      console.error('Error updating potential customer:', error);
      toast.error('Failed to update follow-up date');
    }
  };

  const handleDeletePotentialCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('potential_customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Potential customer removed');
      fetchPotentialCustomers();
    } catch (error) {
      console.error('Error deleting potential customer:', error);
      toast.error('Failed to remove potential customer');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPotentialCustomers = potentialCustomers.filter(customer =>
    customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobile_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((sum, customer) => sum + customer.total_points, 0);
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0);

  if (loading) {
    return <div className="p-4 md:p-6">Loading...</div>;
  }

  const CustomerCard = ({ customer }: { customer: any }) => (
    <Card key={customer.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {customer.customer_name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {editingCustomer === customer.id ? (
                <Input
                  value={editCustomerData.customer_name}
                  onChange={(e) => setEditCustomerData({
                    ...editCustomerData,
                    customer_name: e.target.value
                  })}
                  className="mb-2"
                />
              ) : (
                <div className="font-medium">{customer.customer_name}</div>
              )}
              <div className="text-sm text-muted-foreground">{customer.status}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              {editingCustomer === customer.id ? (
                <Input
                  value={editCustomerData.customer_email}
                  onChange={(e) => setEditCustomerData({
                    ...editCustomerData,
                    customer_email: e.target.value
                  })}
                  className="flex-1"
                />
              ) : (
                <span className="break-all">{customer.customer_email}</span>
              )}
            </div>
            {(customer.customer_phone || editingCustomer === customer.id) && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                {editingCustomer === customer.id ? (
                  <Input
                    value={editCustomerData.customer_phone}
                    onChange={(e) => setEditCustomerData({
                      ...editCustomerData,
                      customer_phone: e.target.value
                    })}
                    className="flex-1"
                  />
                ) : (
                  <span>{customer.customer_phone}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{customer.total_points} points</span>
            </div>
            <Badge variant="outline">
              {customer.total_bookings} bookings
            </Badge>
            <span className="font-medium">₹{customer.total_spent.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={customer.status === 'Registered' ? "default" : "secondary"}>
              {customer.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {editingCustomer === customer.id ? (
              <>
                <Button
                  size="sm"
                  onClick={() => handleSaveCustomer(customer.id)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCustomer(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Follow-up
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add to Potential Follow-ups</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="followUpDate">Follow-up Date</Label>
                        <Input
                          id="followUpDate"
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleAddToPotential(customer)}>
                          Add to Follow-ups
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PotentialCustomerCard = ({ customer }: { customer: PotentialCustomer }) => {
    const isToday = customer.follow_up_date === new Date().toISOString().split('T')[0];
    return (
      <Card key={customer.id} className={`mb-4 ${isToday ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="font-medium">{customer.customer_name}</div>
            
            <div className="space-y-2 text-sm">
              <div>Mobile: {customer.mobile_number || 'N/A'}</div>
              <Badge variant={
                customer.customer_type === 'royal' ? 'default' : 
                customer.customer_type === 'elite' ? 'secondary' : 'outline'
              }>
                {customer.customer_type?.charAt(0).toUpperCase() + customer.customer_type?.slice(1) || 'Normal'}
              </Badge>
            </div>

            <div>
              {editingPotential === customer.id ? (
                <div className="flex flex-col gap-2">
                  <Input
                    type="date"
                    defaultValue={customer.follow_up_date || ''}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdatePotentialCustomer(customer.id!, { follow_up_date: followUpDate || null })}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingPotential(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Follow-up: {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : 'N/A'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingPotential(customer.id!)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeletePotentialCustomer(customer.id!)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportCustomersToExcel(customers)}
            className="flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportCustomersToPDF(customers)}
            className="flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => setIsAddingPotential(true)} className="flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Potential Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{totalPoints.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{potentialCustomers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Existing Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {customer.customer_name?.split(' ').map(n => n[0]).join('') || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            {editingCustomer === customer.id ? (
                              <Input
                                value={editCustomerData.customer_name}
                                onChange={(e) => setEditCustomerData({
                                  ...editCustomerData,
                                  customer_name: e.target.value
                                })}
                                className="w-32"
                              />
                            ) : (
                              <div className="font-medium">{customer.customer_name}</div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              {customer.status}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {editingCustomer === customer.id ? (
                              <Input
                                value={editCustomerData.customer_email}
                                onChange={(e) => setEditCustomerData({
                                  ...editCustomerData,
                                  customer_email: e.target.value
                                })}
                                className="w-32"
                              />
                            ) : (
                              customer.customer_email
                            )}
                          </div>
                          {(customer.customer_phone || editingCustomer === customer.id) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {editingCustomer === customer.id ? (
                                <Input
                                  value={editCustomerData.customer_phone}
                                  onChange={(e) => setEditCustomerData({
                                    ...editCustomerData,
                                    customer_phone: e.target.value
                                  })}
                                  className="w-32"
                                />
                              ) : (
                                customer.customer_phone
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {customer.total_points}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.total_bookings} bookings
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">₹{customer.total_spent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.status === 'Registered' ? "default" : "secondary"}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingCustomer === customer.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveCustomer(customer.id)}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingCustomer(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCustomer(customer)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    <UserPlus className="h-3 w-3" />
                                    Add to Follow-up
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add to Potential Follow-ups</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="followUpDate">Follow-up Date</Label>
                                      <Input
                                        id="followUpDate"
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={() => handleAddToPotential(customer)}>
                                        Add to Follow-ups
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Potential Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Potential Customers & Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {filteredPotentialCustomers.map((customer) => (
                <PotentialCustomerCard key={customer.id} customer={customer} />
              ))}
              {filteredPotentialCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No potential customers found
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Customer Type</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPotentialCustomers.map((customer) => {
                    const isToday = customer.follow_up_date === new Date().toISOString().split('T')[0];
                    return (
                      <TableRow key={customer.id} className={isToday ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}>
                        <TableCell className="font-medium">{customer.customer_name}</TableCell>
                        <TableCell>{customer.mobile_number || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            customer.customer_type === 'royal' ? 'default' : 
                            customer.customer_type === 'elite' ? 'secondary' : 'outline'
                          }>
                            {customer.customer_type?.charAt(0).toUpperCase() + customer.customer_type?.slice(1) || 'Normal'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                        {editingPotential === customer.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              type="date"
                              defaultValue={customer.follow_up_date || ''}
                              onChange={(e) => setFollowUpDate(e.target.value)}
                              className="w-auto"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdatePotentialCustomer(customer.id!, { follow_up_date: followUpDate || null })}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingPotential(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span>{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : 'N/A'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingPotential !== customer.id && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingPotential(customer.id!)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeletePotentialCustomer(customer.id!)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
              {filteredPotentialCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No potential customers found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Potential Customer Dialog */}
      <Dialog open={isAddingPotential} onOpenChange={setIsAddingPotential}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Potential Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={newPotentialCustomer.customer_name}
                onChange={(e) => setNewPotentialCustomer({
                  ...newPotentialCustomer,
                  customer_name: e.target.value
                })}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={newPotentialCustomer.mobile_number}
                onChange={(e) => setNewPotentialCustomer({
                  ...newPotentialCustomer,
                  mobile_number: e.target.value
                })}
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <Label htmlFor="customerType">Customer Type</Label>
              <Select value={newPotentialCustomer.customer_type} onValueChange={(value: 'royal' | 'elite' | 'normal') => setNewPotentialCustomer({
                ...newPotentialCustomer,
                customer_type: value
              })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                  <SelectItem value="royal">Royal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newFollowUpDate">Follow-up Date (Optional)</Label>
              <Input
                id="newFollowUpDate"
                type="date"
                value={newPotentialCustomer.follow_up_date || ''}
                onChange={(e) => setNewPotentialCustomer({
                  ...newPotentialCustomer,
                  follow_up_date: e.target.value || null
                })}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleAddNewPotential} className="flex-1">Add Customer</Button>
              <Button variant="outline" onClick={() => setIsAddingPotential(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
