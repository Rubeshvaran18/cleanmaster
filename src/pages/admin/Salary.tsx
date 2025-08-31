
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DollarSign, Users, Calendar, Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  advance: number;
  status: string;
}

interface DailySalaryRecord {
  id: string;
  employee_id: string;
  date: string;
  daily_salary: number;
  hours_worked: number;
  overtime_hours: number;
  overtime_rate: number;
  allowances: number;
  deductions: number;
  total_amount: number;
  status: string;
  notes?: string;
}

interface DailySummary {
  date: string;
  totalAmount: number;
  employeeCount: number;
  records: DailySalaryRecord[];
}

const Salary = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailySalaryRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlySummary, setMonthlySummary] = useState<DailySummary[]>([]);
  const [salaryForm, setSalaryForm] = useState({
    daily_salary: 0,
    hours_worked: 8,
    overtime_hours: 0,
    overtime_rate: 0,
    allowances: 0,
    deductions: 0,
    notes: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchDailyRecords();
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthlySummary();
  }, [selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_salary_records')
        .select('*')
        .eq('date', selectedDate);

      if (error) throw error;
      setDailyRecords(data || []);
    } catch (error) {
      console.error('Error fetching daily records:', error);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(selectedMonth + '-01');
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateString = endDate.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('daily_salary_records')
        .select('*')
        .gte('date', startDate)
        .lt('date', endDateString)
        .order('date', { ascending: false });

      if (error) throw error;

      // Group by date and calculate daily summaries
      const summaryMap = new Map<string, DailySummary>();
      
      data?.forEach((record) => {
        const date = record.date;
        if (!summaryMap.has(date)) {
          summaryMap.set(date, {
            date,
            totalAmount: 0,
            employeeCount: 0,
            records: []
          });
        }
        
        const summary = summaryMap.get(date)!;
        summary.totalAmount += record.total_amount || 0;
        summary.employeeCount += 1;
        summary.records.push(record);
      });

      setMonthlySummary(Array.from(summaryMap.values()));
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    }
  };

  const calculateTotalAmount = () => {
    const { daily_salary, overtime_hours, overtime_rate, allowances, deductions } = salaryForm;
    const overtimePay = overtime_hours * overtime_rate;
    return daily_salary + overtimePay + allowances - deductions;
  };

  const processDailySalary = async () => {
    if (!selectedEmployee) return;

    try {
      const totalAmount = calculateTotalAmount();
      
      // Check if a record already exists for this employee and date
      const { data: existingRecord, error: checkError } = await supabase
        .from('daily_salary_records')
        .select('id')
        .eq('employee_id', selectedEmployee.id)
        .eq('date', selectedDate)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }

      let result;
      
      if (existingRecord) {
        // Update existing record
        result = await supabase
          .from('daily_salary_records')
          .update({
            ...salaryForm,
            total_amount: totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
      } else {
        // Insert new record
        result = await supabase
          .from('daily_salary_records')
          .insert({
            employee_id: selectedEmployee.id,
            date: selectedDate,
            ...salaryForm,
            total_amount: totalAmount
          });
      }

      if (result.error) throw result.error;
      
      toast.success(`Daily salary ${existingRecord ? 'updated' : 'processed'} successfully`);
      fetchDailyRecords();
      fetchMonthlySummary();
      setSelectedEmployee(null);
      setSalaryForm({
        daily_salary: 0,
        hours_worked: 8,
        overtime_hours: 0,
        overtime_rate: 0,
        allowances: 0,
        deductions: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error processing daily salary:', error);
      toast.error('Failed to process daily salary');
    }
  };

  const getDailySalaryForEmployee = (employeeId: string) => {
    return dailyRecords.find(record => record.employee_id === employeeId);
  };

  const totalDailySalary = dailyRecords.reduce((sum, record) => sum + record.total_amount, 0);
  const totalMonthlySalary = monthlySummary.reduce((sum, summary) => sum + summary.totalAmount, 0);

  if (loading) {
    return <div className="space-y-6"><div className="p-6">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daily Salary Management</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Active Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">₹{totalDailySalary.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Daily Total ({selectedDate})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">₹{totalMonthlySalary.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Monthly Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{dailyRecords.length}</p>
                <p className="text-sm text-muted-foreground">Processed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Monthly Summary
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-40"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {monthlySummary.map((summary) => (
              <div key={summary.date} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{summary.date}</div>
                  <div className="text-sm text-muted-foreground">{summary.employeeCount} employees processed</div>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  ₹{summary.totalAmount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Daily Salary Records */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Daily Salary Records for {selectedDate}</h2>
        
        {employees.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No employees found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => {
              const dailyRecord = getDailySalaryForEmployee(employee.id);
              return (
                <Card key={employee.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{employee.name}</h3>
                          <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                            {employee.status}
                          </Badge>
                          {dailyRecord && (
                            <Badge variant="outline" className="text-green-600">
                              Processed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{employee.id} • {employee.position} • {employee.department}</p>
                        {dailyRecord && (
                          <div className="text-sm text-muted-foreground">
                            Hours: {dailyRecord.hours_worked} | Total: ₹{dailyRecord.total_amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              if (dailyRecord) {
                                setSalaryForm({
                                  daily_salary: dailyRecord.daily_salary,
                                  hours_worked: dailyRecord.hours_worked,
                                  overtime_hours: dailyRecord.overtime_hours,
                                  overtime_rate: dailyRecord.overtime_rate,
                                  allowances: dailyRecord.allowances,
                                  deductions: dailyRecord.deductions,
                                  notes: dailyRecord.notes || ''
                                });
                              } else {
                                setSalaryForm({
                                  daily_salary: Math.round(employee.salary / 30), // Estimate daily from monthly
                                  hours_worked: 8,
                                  overtime_hours: 0,
                                  overtime_rate: 0,
                                  allowances: 0,
                                  deductions: 0,
                                  notes: ''
                                });
                              }
                            }}
                          >
                            {dailyRecord ? <Edit className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                            {dailyRecord ? 'Edit' : 'Process'} Salary
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              {dailyRecord ? 'Edit' : 'Process'} Daily Salary - {employee.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="daily_salary">Daily Salary</Label>
                                <Input
                                  id="daily_salary"
                                  type="number"
                                  value={salaryForm.daily_salary}
                                  onChange={(e) => setSalaryForm({...salaryForm, daily_salary: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="hours_worked">Hours Worked</Label>
                                <Input
                                  id="hours_worked"
                                  type="number"
                                  value={salaryForm.hours_worked}
                                  onChange={(e) => setSalaryForm({...salaryForm, hours_worked: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="overtime_hours">Overtime Hours</Label>
                                <Input
                                  id="overtime_hours"
                                  type="number"
                                  value={salaryForm.overtime_hours}
                                  onChange={(e) => setSalaryForm({...salaryForm, overtime_hours: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="overtime_rate">Overtime Rate</Label>
                                <Input
                                  id="overtime_rate"
                                  type="number"
                                  value={salaryForm.overtime_rate}
                                  onChange={(e) => setSalaryForm({...salaryForm, overtime_rate: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="allowances">Allowances</Label>
                                <Input
                                  id="allowances"
                                  type="number"
                                  value={salaryForm.allowances}
                                  onChange={(e) => setSalaryForm({...salaryForm, allowances: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="deductions">Deductions</Label>
                                <Input
                                  id="deductions"
                                  type="number"
                                  value={salaryForm.deductions}
                                  onChange={(e) => setSalaryForm({...salaryForm, deductions: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="notes">Notes</Label>
                              <Input
                                id="notes"
                                value={salaryForm.notes}
                                onChange={(e) => setSalaryForm({...salaryForm, notes: e.target.value})}
                                placeholder="Optional notes"
                              />
                            </div>
                            
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="text-sm font-medium">Total Amount: ₹{calculateTotalAmount().toLocaleString()}</p>
                            </div>
                            
                            <Button onClick={processDailySalary} className="w-full">
                              {dailyRecord ? 'Update' : 'Process'} Daily Salary
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
        )}
      </div>
    </div>
  );
};

export default Salary;
