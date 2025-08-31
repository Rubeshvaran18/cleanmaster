import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  salary: number;
  advance: number;
}

interface ProcessSalaryModalProps {
  onSalaryProcessed: () => void;
}

export const ProcessSalaryModal = ({ onSalaryProcessed }: ProcessSalaryModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    month: "",
    year: "",
    basic_salary: "",
    allowances: "",
    deductions: "",
    overtime_hours: "",
    overtime_rate: ""
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, salary, advance')
        .eq('status', 'Active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const overtimeHours = parseFloat(formData.overtime_hours) || 0;
    const overtimeRate = parseFloat(formData.overtime_rate) || 0;
    const overtimeAmount = overtimeHours * overtimeRate;
    
    return basic + allowances + overtimeAmount - deductions;
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setFormData({
        ...formData,
        employee_id: employeeId,
        basic_salary: employee.salary.toString(),
        deductions: employee.advance.toString()
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const netSalary = calculateNetSalary();
      
      // Here you would typically insert into a salary_records table
      // For now, we'll just show success and reset the advance for the employee
      const { error } = await supabase
        .from('employees')
        .update({ advance: 0 })
        .eq('id', formData.employee_id);

      if (error) throw error;

      toast.success(`Salary processed successfully. Net amount: ₹${netSalary.toLocaleString()}`);
      setFormData({
        employee_id: "",
        month: "",
        year: "",
        basic_salary: "",
        allowances: "",
        deductions: "",
        overtime_hours: "",
        overtime_rate: ""
      });
      setOpen(false);
      onSalaryProcessed();
    } catch (error) {
      console.error('Error processing salary:', error);
      toast.error("Failed to process salary");
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 text-sm sm:text-base">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Process Salary</span>
          <span className="sm:hidden">Process</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Process Employee Salary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="employee_id">Select Employee</Label>
              <Select onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - ₹{employee.salary.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, month: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder={currentYear.toString()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary</Label>
              <Input
                id="basic_salary"
                type="number"
                step="0.01"
                value={formData.basic_salary}
                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allowances">Allowances</Label>
              <Input
                id="allowances"
                type="number"
                step="0.01"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions (incl. advance)</Label>
              <Input
                id="deductions"
                type="number"
                step="0.01"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overtime_hours">Overtime Hours</Label>
              <Input
                id="overtime_hours"
                type="number"
                step="0.5"
                value={formData.overtime_hours}
                onChange={(e) => setFormData({ ...formData, overtime_hours: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime_rate">Overtime Rate per Hour</Label>
              <Input
                id="overtime_rate"
                type="number"
                step="0.01"
                value={formData.overtime_rate}
                onChange={(e) => setFormData({ ...formData, overtime_rate: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          {formData.basic_salary && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Basic Salary:</span>
                  <span>₹{parseFloat(formData.basic_salary || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowances:</span>
                  <span className="text-green-600">+₹{parseFloat(formData.allowances || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime:</span>
                  <span className="text-green-600">+₹{((parseFloat(formData.overtime_hours || "0")) * (parseFloat(formData.overtime_rate || "0"))).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span className="text-red-600">-₹{parseFloat(formData.deductions || "0").toLocaleString()}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Net Salary:</span>
                  <span>₹{calculateNetSalary().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.employee_id}>
              {loading ? "Processing..." : "Process Salary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};