
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Loader2, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AccountsSummary } from '@/components/accounts/AccountsSummary';
import { PrintableInvoice } from '@/components/accounts/PrintableInvoice';
import { useAccountsData } from '@/hooks/useAccountsData';
import { useExportData } from '@/hooks/useExportData';
import { supabase } from '@/integrations/supabase/client';
import { useReactToPrint } from 'react-to-print';

interface ExpenseItem {
  id: string;
  type: string;
  amount: number;
  [key: string]: string | number;
}

interface RepairMaintenanceItem {
  id: string;
  type: string;
  amount: number;
  description: string;
  [key: string]: string | number;
}

interface Employee {
  id: string;
  name: string;
  salary: number;
  position: string;
  status: string;
}

const Accounts = () => {
  const [currentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { accountsData, loading: accountsLoading } = useAccountsData(currentMonth);
  const { exportToExcel, exportToPDF } = useExportData();
  const printRef = useRef<HTMLDivElement>(null);
  const [directExpenses, setDirectExpenses] = useState<ExpenseItem[]>([]);
  const [salaryExpenses, setSalaryExpenses] = useState<ExpenseItem[]>([]);
  const [repairMaintenance, setRepairMaintenance] = useState<RepairMaintenanceItem[]>([]);
  const [deposits, setDeposits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showInvoice, setShowInvoice] = useState(false);

  // Predefined options for dropdowns
  const directExpenseTypes = [
    'Mobile Bill',
    'EB Bill', 
    'Petrol',
    'Office Supplies',
    'Marketing & Advertising',
    'Utilities',
    'Rent',
    'Insurance',
    'Transportation',
    'Communication',
    'Professional Services',
    'Equipment Purchase',
    'Software & Licenses',
    'Training & Development',
    'Miscellaneous'
  ];

  const repairMaintenanceTypes = [
    'Equipment Repair',
    'Vehicle Maintenance',
    'Building Maintenance',
    'HVAC Service',
    'Electrical Repair',
    'Plumbing',
    'IT Equipment Service',
    'Safety Equipment',
    'Cleaning Services',
    'Landscaping',
    'Security System',
    'Other Repairs'
  ];

  const depositTypes = [
    'Customer Deposits',
    'Security Deposits',
    'Advance Payments',
    'Retainer Fees',
    'Equipment Deposits',
    'Service Deposits',
    'Project Deposits',
    'Emergency Fund',
    'Reserve Fund',
    'Other Deposits'
  ];

  // Helper function to safely parse JSON array
  const parseJsonArray = <T,>(data: any, fallback: T[]): T[] => {
    if (Array.isArray(data)) {
      return data as T[];
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  useEffect(() => {
    loadMonthData();
    fetchEmployees();
  }, [currentMonth]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, salary, position, status')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('month', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading month data:', error);
        toast.error('Failed to load month data');
        return;
      }

      if (data) {
        setDirectExpenses(parseJsonArray(data.direct_expenses, []));
        setSalaryExpenses(parseJsonArray(data.salary_expenses, []));
        setRepairMaintenance(parseJsonArray(data.repair_maintenance, []));
        setDeposits(typeof data.deposits === 'number' ? data.deposits : 0);
      } else {
        // Initialize with default expenses if no data exists
        const defaultExpenses: ExpenseItem[] = [
          { id: Math.random().toString(36).substr(2, 9), type: 'Mobile Bill', amount: 0 },
          { id: Math.random().toString(36).substr(2, 9), type: 'EB Bill', amount: 0 },
          { id: Math.random().toString(36).substr(2, 9), type: 'Petrol', amount: 0 }
        ];
        setDirectExpenses(defaultExpenses);
      }
    } catch (error) {
      console.error('Error loading month data:', error);
      toast.error('Failed to load month data');
    } finally {
      setLoading(false);
    }
  };

  const saveMonthData = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        month: currentMonth,
        direct_expenses: directExpenses as any,
        salary_expenses: salaryExpenses as any,
        repair_maintenance: repairMaintenance as any,
        deposits: deposits,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('monthly_expenses')
        .upsert(dataToSave, {
          onConflict: 'month'
        });

      if (error) {
        console.error('Error saving month data:', error);
        toast.error('Failed to save month data');
      } else {
        toast.success('Month data saved successfully');
      }
    } catch (error) {
      console.error('Error saving month data:', error);
      toast.error('Failed to save month data');
    } finally {
      setSaving(false);
    }
  };

  // Calculate totals for AccountsSummary using real accounts data
  const calculateTotals = () => {
    const totalDirectExpenses = directExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalSalaryExpensesFromForm = salaryExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalRepairMaintenance = repairMaintenance.reduce((sum, item) => sum + item.amount, 0);
    
    // Use actual salary expenses from accounts data if available, otherwise use form data
    const totalSalaryExpenses = accountsData.totalSalaryExpenses || totalSalaryExpensesFromForm;
    const totalExpenses = totalDirectExpenses + totalSalaryExpenses + totalRepairMaintenance;

    // Use real revenue data from accounts
    const totalRevenue = accountsData.totalRevenue + accountsData.totalCustomerRecordsRevenue;
    const netProfit = totalRevenue - totalExpenses;
    const netBalance = netProfit + deposits - accountsData.overdue;

    return {
      totalRevenue,
      totalDirectExpenses,
      totalSalaryExpenses,
      totalRepairMaintenance,
      totalExpenses,
      deposits,
      netProfit,
      overdue: accountsData.overdue,
      netBalance,
    };
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Accounts_Invoice_${currentMonth}`,
    onAfterPrint: () => {
      setShowInvoice(false);
      toast.success('Invoice printed successfully');
    },
  });

  const exportAccountsToExcel = () => {
    const totals = calculateTotals();
    const exportData = [
      { Category: 'Revenue', Amount: totals.totalRevenue },
      { Category: 'Direct Expenses', Amount: totals.totalDirectExpenses },
      { Category: 'Salary Expenses', Amount: totals.totalSalaryExpenses },
      { Category: 'Repair & Maintenance', Amount: totals.totalRepairMaintenance },
      { Category: 'Deposits', Amount: totals.deposits },
      { Category: 'Net Profit', Amount: totals.netProfit },
      { Category: 'Overdue', Amount: totals.overdue },
      { Category: 'Net Balance', Amount: totals.netBalance },
    ];
    
    exportToExcel(exportData, `accounts_summary_${currentMonth}`, 'Accounts Summary');
  };

  const exportAccountsToPDF = () => {
    const totals = calculateTotals();
    const columns = [
      { header: 'Category', dataKey: 'Category' },
      { header: 'Amount (₹)', dataKey: 'Amount' }
    ];
    
    const exportData = [
      { Category: 'Revenue', Amount: totals.totalRevenue },
      { Category: 'Direct Expenses', Amount: totals.totalDirectExpenses },
      { Category: 'Salary Expenses', Amount: totals.totalSalaryExpenses },
      { Category: 'Repair & Maintenance', Amount: totals.totalRepairMaintenance },
      { Category: 'Deposits', Amount: totals.deposits },
      { Category: 'Net Profit', Amount: totals.netProfit },
      { Category: 'Overdue', Amount: totals.overdue },
      { Category: 'Net Balance', Amount: totals.netBalance },
    ];
    
    exportToPDF(exportData, `accounts_summary_${currentMonth}`, 'Accounts Summary Report', columns);
  };

  const generateInvoice = () => {
    setShowInvoice(true);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const addDirectExpense = () => {
    const newExpense: ExpenseItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: '',
      amount: 0
    };
    setDirectExpenses([...directExpenses, newExpense]);
  };

  const removeDirectExpense = (id: string) => {
    setDirectExpenses(directExpenses.filter(expense => expense.id !== id));
  };

  const updateDirectExpense = (id: string, field: keyof ExpenseItem, value: string | number) => {
    setDirectExpenses(directExpenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const addSalaryExpense = () => {
    const newExpense: ExpenseItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: '',
      amount: 0
    };
    setSalaryExpenses([...salaryExpenses, newExpense]);
  };

  const removeSalaryExpense = (id: string) => {
    setSalaryExpenses(salaryExpenses.filter(expense => expense.id !== id));
  };

  const updateSalaryExpense = (id: string, field: keyof ExpenseItem, value: string | number) => {
    if (field === 'type') {
      // When employee is selected, auto-fill the salary amount
      const selectedEmployee = employees.find(emp => emp.name === value);
      setSalaryExpenses(salaryExpenses.map(expense => 
        expense.id === id ? { 
          ...expense, 
          [field]: String(value),
          amount: selectedEmployee ? selectedEmployee.salary : expense.amount
        } : expense
      ));
    } else {
      setSalaryExpenses(salaryExpenses.map(expense => 
        expense.id === id ? { ...expense, [field]: value } : expense
      ));
    }
  };

  const addRepairMaintenance = () => {
    const newItem: RepairMaintenanceItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: '',
      amount: 0,
      description: ''
    };
    setRepairMaintenance([...repairMaintenance, newItem]);
  };

  const removeRepairMaintenance = (id: string) => {
    setRepairMaintenance(repairMaintenance.filter(item => item.id !== id));
  };

  const updateRepairMaintenance = (id: string, field: keyof RepairMaintenanceItem, value: string | number) => {
    setRepairMaintenance(repairMaintenance.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  if (loading || accountsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header Section - Mobile Optimized */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Accounts Management</h1>
          
          {/* Action Buttons - Stack on smaller screens */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={exportAccountsToExcel} variant="outline" size="sm" className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportAccountsToPDF} variant="outline" size="sm" className="w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={generateInvoice} variant="outline" size="sm" className="w-full sm:w-auto">
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            <Button onClick={saveMonthData} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <AccountsSummary 
        accountsData={accountsData}
        totals={calculateTotals()}
      />

      {/* Mobile-friendly Tabs */}
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="direct" className="text-xs sm:text-sm px-2 py-2">
            Direct Expenses
          </TabsTrigger>
          <TabsTrigger value="salary" className="text-xs sm:text-sm px-2 py-2">
            Salary Expenses
          </TabsTrigger>
          <TabsTrigger value="repair" className="text-xs sm:text-sm px-2 py-2">
            Repair & Maintenance
          </TabsTrigger>
          <TabsTrigger value="deposits" className="text-xs sm:text-sm px-2 py-2">
            Deposits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="direct">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span>Direct Expenses</span>
                <Button onClick={addDirectExpense} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {directExpenses.map((expense) => (
                  <div key={expense.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`direct-type-${expense.id}`}>Expense Type</Label>
                      <Select
                        value={expense.type}
                        onValueChange={(value) => updateDirectExpense(expense.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select expense type" />
                        </SelectTrigger>
                        <SelectContent>
                          {directExpenseTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`direct-amount-${expense.id}`}>Amount (₹)</Label>
                        <Input
                          id={`direct-amount-${expense.id}`}
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateDirectExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeDirectExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {directExpenses.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No direct expenses added yet. Click "Add Expense" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span>Salary Expenses</span>
                <Button onClick={addSalaryExpense} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Salary
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaryExpenses.map((expense) => (
                  <div key={expense.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`salary-type-${expense.id}`}>Employee</Label>
                      <Select
                        value={expense.type}
                        onValueChange={(value) => updateSalaryExpense(expense.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.name}>
                              {employee.name} - {employee.position} (₹{employee.salary})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`salary-amount-${expense.id}`}>Salary (₹)</Label>
                        <Input
                          id={`salary-amount-${expense.id}`}
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateSalaryExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSalaryExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {salaryExpenses.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No salary expenses added yet. Click "Add Salary" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repair">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span>Repair & Maintenance</span>
                <Button onClick={addRepairMaintenance} size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairMaintenance.map((item) => (
                  <div key={item.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`repair-type-${item.id}`}>Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) => updateRepairMaintenance(item.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select repair/maintenance type" />
                        </SelectTrigger>
                        <SelectContent>
                          {repairMaintenanceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`repair-amount-${item.id}`}>Amount (₹)</Label>
                      <Input
                        id={`repair-amount-${item.id}`}
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateRepairMaintenance(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`repair-desc-${item.id}`}>Description</Label>
                      <Textarea
                        id={`repair-desc-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateRepairMaintenance(item.id, 'description', e.target.value)}
                        placeholder="Description of repair/maintenance"
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRepairMaintenance(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {repairMaintenance.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No repair & maintenance items added yet. Click "Add Item" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deposits">Total Deposits (₹)</Label>
                  <Input
                    id="deposits"
                    type="number"
                    value={deposits}
                    onChange={(e) => setDeposits(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Deposit Types Reference:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {depositTypes.map((type) => (
                      <div key={type} className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the total amount of deposits received this month from various sources.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden invoice component for printing */}
      {showInvoice && (
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <PrintableInvoice
              data={{
                month: currentMonth,
                directExpenses: directExpenses.map(exp => ({
                  id: exp.id,
                  category: exp.type,
                  amount: exp.amount
                })),
                salaryExpenses: salaryExpenses.map(exp => ({
                  id: exp.id,
                  category: exp.type,
                  amount: exp.amount
                })),
                repairMaintenance: repairMaintenance.map(item => ({
                  id: item.id,
                  type: item.type,
                  amount: item.amount
                })),
                deposits,
                totals: calculateTotals(),
                accountsData
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
