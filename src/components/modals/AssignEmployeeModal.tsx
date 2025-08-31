import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  department: string;
  status: string;
}

interface Booking {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
}

interface AssignEmployeeModalProps {
  booking: Booking;
  onAssignmentComplete: () => void;
}

export const AssignEmployeeModal = ({ booking, onAssignmentComplete }: AssignEmployeeModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, department, status')
        .eq('status', 'Active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('task_assignments')
        .insert({
          booking_id: booking.id,
          employee_id: selectedEmployee,
          status: 'Assigned',
          notes: notes || null
        });

      if (error) throw error;

      toast.success("Employee assigned successfully");
      setSelectedEmployee("");
      setNotes("");
      setOpen(false);
      onAssignmentComplete();
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast.error("Failed to assign employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Assign Employee</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Employee to Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">Booking Details</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Customer:</strong> {booking.customer_name}</p>
              <p><strong>Service:</strong> {booking.service_name}</p>
              <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.booking_time}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee">Select Employee</Label>
            <Select onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} - {employee.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes for the employee..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={loading || !selectedEmployee}>
              {loading ? "Assigning..." : "Assign Employee"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};