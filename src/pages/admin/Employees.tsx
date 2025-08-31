
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Phone, Mail, Calendar, DollarSign, User } from "lucide-react";
import { AddEmployeeModal } from "@/components/modals/AddEmployeeModal";
import { EditEmployeeModal } from "@/components/modals/EditEmployeeModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  phone?: string;
  email?: string;
  salary?: number;
  hire_date?: string;
  status?: string;
  employment_type?: string;
  address?: string;
  age?: number;
  blood_group?: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const totalSalary = employees.reduce((sum, employee) => sum + (employee.salary || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <AddEmployeeModal onEmployeeAdded={fetchEmployees} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xl font-bold">{employees.length}</p>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-green-600">{activeEmployees}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-xl font-bold text-purple-600">₹{totalSalary.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Salary</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                </div>
                <Badge 
                  variant={employee.status === 'Active' ? 'default' : 'secondary'}
                  className={employee.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {employee.status || 'Active'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.email}</span>
                  </div>
                )}
                {employee.hire_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {employee.salary && (
                  <Badge variant="outline">
                    ₹{employee.salary.toLocaleString()}/month
                  </Badge>
                )}
                {employee.employment_type && (
                  <Badge variant="outline">
                    {employee.employment_type}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <EditEmployeeModal 
                  employee={{
                    ...employee,
                    address: employee.address || '',
                    age: employee.age || 0,
                    blood_group: employee.blood_group || '',
                    email: employee.email || '',
                    phone: employee.phone || '',
                    salary: employee.salary || 0,
                    employment_type: employee.employment_type || 'full-time',
                    status: employee.status || 'Active'
                  }}
                  onEmployeeUpdated={fetchEmployees}
                />
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No employees found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
