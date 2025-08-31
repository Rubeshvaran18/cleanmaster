
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface EmployeeSalaryData {
  name: string;
  salary: number;
  color: string;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export const EmployeeSalaryChart = () => {
  const [data, setData] = useState<EmployeeSalaryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeSalaryData();
  }, []);

  const fetchEmployeeSalaryData = async () => {
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('name, salary')
        .eq('status', 'Active')
        .order('salary', { ascending: false });

      if (error) throw error;

      const chartData = employees?.map((employee, index) => ({
        name: employee.name,
        salary: employee.salary || 0,
        color: COLORS[index % COLORS.length]
      })) || [];

      setData(chartData);
    } catch (error) {
      console.error('Error fetching employee salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSalary = data.reduce((sum, item) => sum + item.salary, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Salary Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Salary Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">No employee data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Salary Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total Monthly Salary: ₹{totalSalary.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="salary"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Salary']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
