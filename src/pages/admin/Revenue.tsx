
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddBranchModal } from "@/components/modals/AddBranchModal";

interface Branch {
  id: string;
  name: string;
  location: string;
  revenue: number;
  manager_id: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
}

interface ManagerRevenue {
  id: string;
  manager_id: string;
  date: string;
  revenue_generated: number;
  expenses: number;
  profit: number;
  tasks_received: number;
  task_amounts: number;
}

interface Booking {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Revenue = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [managerRevenues, setManagerRevenues] = useState<ManagerRevenue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedManager, setSelectedManager] = useState<Employee | null>(null);
  const [revenueForm, setRevenueForm] = useState({
    revenue_generated: 0,
    expenses: 0,
    tasks_received: 0,
    task_amounts: 0
  });

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for bookings
    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          console.log('Booking updated, refreshing revenue data...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBranches(),
      fetchManagers(),
      fetchManagerRevenues(),
      fetchBookings()
    ]);
    setLoading(false);
  };

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setBranches(data || []);
      const total = data?.reduce((sum, branch) => sum + (branch.revenue || 0), 0) || 0;
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error("Failed to fetch branch data");
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, total_amount, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      
      // Update branch revenue based on bookings
      const todaysBookings = data?.filter(booking => 
        booking.created_at.startsWith(selectedDate)
      ) || [];
      
      const todaysRevenue = todaysBookings.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0);
      
      console.log(`Today's revenue from bookings: ₹${todaysRevenue}`);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, position, department')
        .in('position', ['Manager', 'Senior Manager', 'Team Lead'])
        .eq('status', 'Active');

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const fetchManagerRevenues = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_revenue')
        .select('*')
        .eq('date', selectedDate);

      if (error) throw error;
      setManagerRevenues(data || []);
    } catch (error) {
      console.error('Error fetching manager revenues:', error);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;

      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error("Failed to delete branch");
    }
  };

  const processManagerRevenue = async () => {
    if (!selectedManager) return;

    try {
      const profit = revenueForm.revenue_generated - revenueForm.expenses;
      
      const { error } = await supabase
        .from('manager_revenue')
        .upsert({
          manager_id: selectedManager.id,
          date: selectedDate,
          ...revenueForm,
          profit
        });

      if (error) throw error;
      
      toast.success('Manager revenue recorded successfully');
      fetchManagerRevenues();
      setSelectedManager(null);
      setRevenueForm({
        revenue_generated: 0,
        expenses: 0,
        tasks_received: 0,
        task_amounts: 0
      });
    } catch (error) {
      console.error('Error processing manager revenue:', error);
      toast.error('Failed to process manager revenue');
    }
  };

  const getManagerRevenue = (managerId: string) => {
    return managerRevenues.find(record => record.manager_id === managerId);
  };

  // Calculate daily revenue from bookings
  const dailyBookings = bookings.filter(booking => 
    booking.created_at.startsWith(selectedDate)
  );
  const dailyBookingRevenue = dailyBookings.reduce((sum, booking) => 
    sum + (booking.total_amount || 0), 0);

  const chartData = branches.map((branch, index) => ({
    name: branch.name,
    value: branch.revenue,
    percentage: totalRevenue > 0 ? ((branch.revenue / totalRevenue) * 100).toFixed(1) : '0',
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-primary">Revenue: ₹{data.value.toLocaleString()}</p>
          <p className="text-muted-foreground">{data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="h-64 flex items-center justify-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="h-64 flex items-center justify-center">
              <p>Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalManagerRevenue = managerRevenues.reduce((sum, record) => sum + record.revenue_generated, 0);
  const totalManagerExpenses = managerRevenues.reduce((sum, record) => sum + record.expenses, 0);
  const totalManagerProfit = managerRevenues.reduce((sum, record) => sum + record.profit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <AddBranchModal onBranchAdded={fetchBranches} />
        </div>
      </div>

      {/* Daily Statistics including bookings */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">₹{totalManagerRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Manager Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">₹{totalManagerExpenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Manager Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">₹{totalManagerProfit.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Manager Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">₹{dailyBookingRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Booking Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{dailyBookings.length}</p>
                <p className="text-sm text-muted-foreground">Daily Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager Revenue Tracking */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manager Revenue for {selectedDate}</h2>
        
        <div className="space-y-4">
          {managers.map((manager) => {
            const revenueRecord = getManagerRevenue(manager.id);
            return (
              <Card key={manager.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{manager.name}</h3>
                      <p className="text-sm text-muted-foreground">{manager.position} • {manager.department}</p>
                      {revenueRecord && (
                        <div className="text-sm space-y-1">
                          <p>Revenue: ₹{revenueRecord.revenue_generated.toLocaleString()}</p>
                          <p>Expenses: ₹{revenueRecord.expenses.toLocaleString()}</p>
                          <p className="font-medium">Profit: ₹{revenueRecord.profit.toLocaleString()}</p>
                          <p>Tasks: {revenueRecord.tasks_received} (₹{revenueRecord.task_amounts.toLocaleString()})</p>
                        </div>
                      )}
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedManager(manager);
                            if (revenueRecord) {
                              setRevenueForm({
                                revenue_generated: revenueRecord.revenue_generated,
                                expenses: revenueRecord.expenses,
                                tasks_received: revenueRecord.tasks_received,
                                task_amounts: revenueRecord.task_amounts
                              });
                            } else {
                              setRevenueForm({
                                revenue_generated: 0,
                                expenses: 0,
                                tasks_received: 0,
                                task_amounts: 0
                              });
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {revenueRecord ? 'Edit' : 'Add'} Revenue
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {revenueRecord ? 'Edit' : 'Add'} Revenue - {manager.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="revenue_generated">Revenue Generated</Label>
                              <Input
                                id="revenue_generated"
                                type="number"
                                value={revenueForm.revenue_generated}
                                onChange={(e) => setRevenueForm({...revenueForm, revenue_generated: parseFloat(e.target.value) || 0})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="expenses">Expenses</Label>
                              <Input
                                id="expenses"
                                type="number"
                                value={revenueForm.expenses}
                                onChange={(e) => setRevenueForm({...revenueForm, expenses: parseFloat(e.target.value) || 0})}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="tasks_received">Tasks Received</Label>
                              <Input
                                id="tasks_received"
                                type="number"
                                value={revenueForm.tasks_received}
                                onChange={(e) => setRevenueForm({...revenueForm, tasks_received: parseInt(e.target.value) || 0})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="task_amounts">Task Amounts</Label>
                              <Input
                                id="task_amounts"
                                type="number"
                                value={revenueForm.task_amounts}
                                onChange={(e) => setRevenueForm({...revenueForm, task_amounts: parseFloat(e.target.value) || 0})}
                              />
                            </div>
                          </div>
                          
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-medium">
                              Profit: ₹{(revenueForm.revenue_generated - revenueForm.expenses).toLocaleString()}
                            </p>
                          </div>
                          
                          <Button onClick={processManagerRevenue} className="w-full">
                            {revenueRecord ? 'Update' : 'Add'} Revenue
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {branches.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No branch data available</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branch Details */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Branch Revenue</p>
              </div>
              
              <div className="space-y-4">
                {branches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No branches found</p>
                    <p className="text-sm text-muted-foreground">Add a branch to get started</p>
                  </div>
                ) : (
                  branches.map((branch) => {
                    const branchManager = managers.find(m => m.id === branch.manager_id);
                    return (
                      <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{branch.name}</h3>
                          <p className="text-sm text-muted-foreground">{branch.location}</p>
                          <p className="text-sm text-blue-600">
                            Manager: {branchManager ? branchManager.name : 'Not Assigned'}
                          </p>
                          <p className="text-lg font-bold">₹{branch.revenue.toLocaleString()}</p>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex items-center space-x-1">
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline text-xs">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Branch</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{branch.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Revenue;
