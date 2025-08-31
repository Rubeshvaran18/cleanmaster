
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountsData {
  totalRevenue: number;
  totalBookings: number;
  totalStockValue: number;
  totalVendorPayments: number;
  totalSubContractorPayments: number;
  totalSalaryExpenses: number;
  totalManagerRevenue: number;
  totalManagerExpenses: number;
  overdue: number;
  totalCustomerRecordsRevenue: number;
  totalCustomerRecordsPaid: number;
}

interface Totals {
  totalRevenue: number;
  totalDirectExpenses: number;
  totalSalaryExpenses: number;
  totalRepairMaintenance: number;
  totalExpenses: number;
  deposits: number;
  netProfit: number;
  overdue: number;
  netBalance: number;
}

interface AccountsSummaryProps {
  accountsData: AccountsData;
  totals: Totals;
}

export const AccountsSummary = ({ accountsData, totals }: AccountsSummaryProps) => {
  const calculatePercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return ((amount / total) * 100).toFixed(1);
  };

  // Calculate manager profit (revenue minus expenses)
  const managerProfit = accountsData.totalManagerRevenue - accountsData.totalManagerExpenses;

  return (
    <div className="space-y-4">
      {/* Main Financial Metrics - Stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              ₹{totals.totalRevenue.toLocaleString()}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mt-2">
              <div>Bookings: ₹{accountsData.totalRevenue.toLocaleString()}</div>
              <div>Customer Records: ₹{accountsData.totalCustomerRecordsRevenue.toLocaleString()}</div>
              <div>From {accountsData.totalBookings} bookings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              ₹{totals.totalExpenses.toLocaleString()}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mt-2">
              <div>Direct: ₹{totals.totalDirectExpenses.toLocaleString()} ({calculatePercentage(totals.totalDirectExpenses, totals.totalRevenue)}%)</div>
              <div>Salary: ₹{totals.totalSalaryExpenses.toLocaleString()}</div>
              <div>R&M: ₹{totals.totalRepairMaintenance.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{totals.netProfit.toLocaleString()}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mt-2">
              <div>Margin: {calculatePercentage(totals.netProfit, totals.totalRevenue)}%</div>
              <div>(Revenue - All Expenses)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${totals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{totals.netBalance.toLocaleString()}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mt-2">
              <div>Profit: ₹{totals.netProfit.toLocaleString()}</div>
              <div>+ Deposits: ₹{totals.deposits.toLocaleString()}</div>
              <div>- Overdue: ₹{totals.overdue.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manager Performance - Full width on mobile */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Manager Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Manager Revenue</div>
              <div className="text-lg font-semibold text-green-600">₹{accountsData.totalManagerRevenue.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Manager Expenses</div>
              <div className="text-lg font-semibold text-red-600">₹{accountsData.totalManagerExpenses.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Manager Profit</div>
              <div className={`text-lg font-semibold ${managerProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{managerProfit.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Profit Margin</div>
              <div className="text-lg font-semibold">
                {accountsData.totalManagerRevenue > 0 ? calculatePercentage(managerProfit, accountsData.totalManagerRevenue) : '0'}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations Summary - Full width on mobile */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Operations Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Daily Salary Expenses</div>
              <div className="text-lg font-semibold text-red-600">₹{accountsData.totalSalaryExpenses.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Stock Value</div>
              <div className="text-lg font-semibold">₹{accountsData.totalStockValue.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Vendor Payments</div>
              <div className="text-lg font-semibold text-red-600">₹{accountsData.totalVendorPayments.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Sub-Contractor Payments</div>
              <div className="text-lg font-semibold text-red-600">₹{accountsData.totalSubContractorPayments.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
