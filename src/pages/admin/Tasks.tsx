import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, MapPin, CheckCircle, AlertCircle, User, Phone, Mail } from "lucide-react";
import { AssignEmployeeModal } from "@/components/modals/AssignEmployeeModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  total_amount: number;
  booking_date: string;
  booking_time: string;
  address: string;
  status: string;
  notes: string;
}

interface TaskAssignment {
  id: string;
  booking_id: string;
  employee_id: string;
  status: string;
  notes: string;
  created_at: string;
  employees: {
    name: string;
  } | null;
}

const Tasks = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch bookings
      const {
        data: bookingsData,
        error: bookingsError
      } = await supabase.from('bookings').select('*').order('booking_date', {
        ascending: true
      });
      if (bookingsError) throw bookingsError;

      // Fetch task assignments with employee info
      const {
        data: assignmentsData,
        error: assignmentsError
      } = await supabase.from('task_assignments').select(`
          *,
          employees:employee_id (name)
        `).order('created_at', {
        ascending: false
      });
      if (assignmentsError) throw assignmentsError;
      setBookings(bookingsData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch bookings and assignments');
    } finally {
      setLoading(false);
    }
  };

  const getLatestAssignment = (bookingId: string) => {
    // Get the most recent assignment for this booking with a valid employee_id
    const bookingAssignments = assignments.filter(a => a.booking_id === bookingId && a.employee_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return bookingAssignments.length > 0 ? bookingAssignments[0] : null;
  };

  const getAssignedEmployee = (bookingId: string) => {
    const assignment = getLatestAssignment(bookingId);
    return assignment?.employees?.name || null;
  };

  const getTaskAssignment = (bookingId: string) => {
    return getLatestAssignment(bookingId);
  };

  const updateTaskStatus = async (assignmentId: string, newStatus: string) => {
    try {
      // Update task assignment status
      const { error: taskError } = await supabase.from('task_assignments').update({
        status: newStatus
      }).eq('id', assignmentId);
      if (taskError) throw taskError;

      // Find the assignment and booking
      const assignment = assignments.find(a => a.id === assignmentId);
      const booking = bookings.find(b => b.id === assignment?.booking_id);

      // If task is completed, also update the booking status and add revenue to manager
      if (newStatus.toLowerCase() === 'completed') {
        if (assignment && booking) {
          // Update booking status to completed
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({ status: 'Completed' })
            .eq('id', booking.id);
          
          if (bookingError) throw bookingError;

          // Add revenue to manager if total_amount exists
          if (booking.total_amount) {
            await addRevenueToManager(assignment.employee_id, booking.total_amount);
            
            // Mark booking as revenue processed
            await supabase
              .from('bookings')
              .update({ revenue_processed: true })
              .eq('id', booking.id);
          }
        }
      }

      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
      fetchData(); // Refresh data to show updated statuses
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const addRevenueToManager = async (employeeId: string, amount: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if manager revenue record exists for today
      const { data: existingRecord, error: fetchError } = await supabase
        .from('manager_revenue')
        .select('*')
        .eq('manager_id', employeeId)
        .eq('date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('manager_revenue')
          .update({
            revenue_generated: existingRecord.revenue_generated + amount,
            task_amounts: existingRecord.task_amounts + amount,
            tasks_received: existingRecord.tasks_received + 1,
            profit: (existingRecord.revenue_generated + amount) - existingRecord.expenses
          })
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('manager_revenue')
          .insert({
            manager_id: employeeId,
            date: today,
            revenue_generated: amount,
            task_amounts: amount,
            tasks_received: 1,
            expenses: 0,
            profit: amount
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error adding revenue to manager:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "destructive";
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return <AlertCircle className="h-3 w-3" />;
      case "in progress":
        return <Clock className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return <div className="space-y-6"><div className="p-6">Loading...</div></div>;
  }

  // Separate bookings into assigned and unassigned
  const assignedBookings = bookings.filter(booking => {
    const assignment = getLatestAssignment(booking.id);
    return assignment && assignment.employee_id;
  });
  const unassignedBookings = bookings.filter(booking => {
    const assignment = getLatestAssignment(booking.id);
    return !assignment || !assignment.employee_id;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Task Management</h1>
        <div className="text-center sm:text-right">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="text-xl sm:text-2xl font-bold">{bookings.length}</p>
        </div>
      </div>

      {/* Assigned Tasks */}
      {assignedBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Assigned Tasks ({assignedBookings.length})</h2>
          
          <div className="space-y-4">
            {assignedBookings.map(booking => {
              const assignedEmployee = getAssignedEmployee(booking.id);
              const taskAssignment = getTaskAssignment(booking.id);
              return (
                <Card key={booking.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="text-lg font-semibold break-words">{booking.customer_name}</h3>
                            
                            {taskAssignment && (
                              <Badge className={`${getTaskStatusColor(taskAssignment.status)} w-fit`}>
                                <div className="flex items-center space-x-1">
                                  {getTaskStatusIcon(taskAssignment.status)}
                                  <span>{taskAssignment.status}</span>
                                </div>
                              </Badge>
                            )}
                          </div>
                          
                          {assignedEmployee && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium">Assigned to: {assignedEmployee}</span>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="break-all">{booking.customer_email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{booking.customer_phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center sm:text-right space-y-1 flex-shrink-0">
                          <p className="text-xl sm:text-2xl font-bold">₹{booking.total_amount?.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{new Date(booking.booking_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{booking.booking_time}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm break-words">{booking.address}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                          <p className="text-sm text-blue-800 break-words">{booking.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">Update Status:</span>
                          <Select
                            value={taskAssignment?.status || "Assigned"}
                            onValueChange={(value) => taskAssignment && updateTaskStatus(taskAssignment.id, value)}
                          >
                            <SelectTrigger className="w-full sm:w-[160px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Assigned">📋 Assigned</SelectItem>
                              <SelectItem value="In Progress">⚡ In Progress</SelectItem>
                              <SelectItem value="Completed">✅ Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Unassigned Tasks */}
      {unassignedBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Unassigned Tasks ({unassignedBookings.length})</h2>
          
          <div className="space-y-4">
            {unassignedBookings.map(booking => (
              <Card key={booking.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-lg font-semibold break-words">{booking.customer_name}</h3>
                          <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 w-fit">
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="h-3 w-3" />
                              <span>Pending Assignment</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="break-all">{booking.customer_email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{booking.customer_phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center sm:text-right space-y-1 flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-bold">₹{booking.total_amount?.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{booking.service_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{booking.booking_time}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm break-words">{booking.address}</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                        <p className="text-sm text-blue-800 break-words">{booking.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        <span className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          <span>No employee assigned yet</span>
                        </span>
                      </div>
                      
                      <AssignEmployeeModal booking={booking} onAssignmentComplete={fetchData} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">No bookings found</p>
            <p className="text-sm text-muted-foreground mt-2">Bookings will appear here when customers make appointments</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tasks;
