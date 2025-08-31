
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { IndianRupee, TrendingUp, Calendar } from 'lucide-react';

interface EmployeeProfit {
  id: string;
  name: string;
  totalRevenue: number;
  totalTasks: number;
  averageRevenuePerTask: number;
  lastTaskDate: string | null;
}

export const EmployeeProfitDisplay = () => {
  const [employeeProfits, setEmployeeProfits] = useState<EmployeeProfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeProfits();
  }, []);

  const fetchEmployeeProfits = async () => {
    try {
      // Get all employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('status', 'Active');

      if (employeesError) throw employeesError;

      // Get daily salary records for each employee
      const profits: EmployeeProfit[] = [];

      for (const employee of employees || []) {
        const { data: salaryRecords, error: salaryError } = await supabase
          .from('daily_salary_records')
          .select('total_amount, date')
          .eq('employee_id', employee.id);

        if (salaryError) {
          console.error('Error fetching salary records:', salaryError);
          continue;
        }

        const totalRevenue = salaryRecords?.reduce((sum, record) => 
          sum + (record.total_amount || 0), 0) || 0;
        
        const totalTasks = salaryRecords?.length || 0;
        const averageRevenuePerTask = totalTasks > 0 ? totalRevenue / totalTasks : 0;
        
        const lastTaskDate = salaryRecords && salaryRecords.length > 0 
          ? salaryRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
          : null;

        profits.push({
          id: employee.id,
          name: employee.name,
          totalRevenue,
          totalTasks,
          averageRevenuePerTask,
          lastTaskDate
        });
      }

      // Sort by total revenue descending
      profits.sort((a, b) => b.totalRevenue - a.totalRevenue);
      setEmployeeProfits(profits);
    } catch (error) {
      console.error('Error fetching employee profits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading employee profits...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Employee Revenue Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Total Revenue</TableHead>
              <TableHead>Tasks Completed</TableHead>
              <TableHead>Avg Revenue/Task</TableHead>
              <TableHead>Last Task</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeeProfits.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="font-medium">{employee.name}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">{employee.totalRevenue.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{employee.totalTasks}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3" />
                    <span>{employee.averageRevenuePerTask.toFixed(0)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {employee.lastTaskDate ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(employee.lastTaskDate).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No tasks</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      employee.totalRevenue > 10000 ? 'bg-green-100 text-green-800' :
                      employee.totalRevenue > 5000 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {employee.totalRevenue > 10000 ? 'High' :
                     employee.totalRevenue > 5000 ? 'Medium' : 'Low'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {employeeProfits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No employee revenue data found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
