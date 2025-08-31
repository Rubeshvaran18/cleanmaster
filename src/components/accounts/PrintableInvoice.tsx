
import { Home } from "lucide-react";

interface PrintableInvoiceProps {
  data: {
    month: string;
    directExpenses: Array<{ id: string; category: string; amount: number }>;
    salaryExpenses: Array<{ id: string; category: string; amount: number }>;
    repairMaintenance: Array<{ id: string; type: string; amount: number }>;
    deposits: number;
    totals: {
      totalRevenue: number;
      totalDirectExpenses: number;
      totalSalaryExpenses: number;
      totalRepairMaintenance: number;
      totalExpenses: number;
      deposits: number;
      netProfit: number;
      overdue: number;
      netBalance: number;
    };
    accountsData: {
      totalRevenue: number;
      totalBookings: number;
      totalStockValue: number;
      totalVendorPayments: number;
      totalSubContractorPayments: number;
      overdue: number;
    };
  };
}

export const PrintableInvoice = ({ data }: PrintableInvoiceProps) => {
  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calculatePercentage = (amount: number, total: number) => {
    if (total === 0) return 0;
    return ((amount / total) * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-6">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
            <Home className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">MASTERKEY</h1>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Financial Report - {formatMonth(data.month)}</h2>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-100 p-2">Financial Summary</h3>
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            <tr className="bg-blue-50">
              <td className="border border-gray-300 p-2 font-semibold">Total Revenue</td>
              <td className="border border-gray-300 p-2 text-right font-semibold">₹{data.totals.totalRevenue.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold">Direct Expenses</td>
              <td className="border border-gray-300 p-2 text-right">₹{data.totals.totalDirectExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 pl-6">
                {data.directExpenses.map((expense, index) => (
                  <div key={expense.id}>
                    {expense.category}: ₹{expense.amount.toLocaleString()} 
                    {data.totals.totalRevenue > 0 && ` (${calculatePercentage(expense.amount, data.totals.totalRevenue)}%)`}
                    {index < data.directExpenses.length - 1 && <br />}
                  </div>
                ))}
              </td>
              <td className="border border-gray-300 p-2 text-right font-semibold">₹{data.totals.totalDirectExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold">Salary Expenses</td>
              <td className="border border-gray-300 p-2 text-right">₹{data.totals.totalSalaryExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 pl-6">
                {data.salaryExpenses.map((expense, index) => (
                  <div key={expense.id}>
                    {expense.category}: ₹{expense.amount.toLocaleString()}
                    {index < data.salaryExpenses.length - 1 && <br />}
                  </div>
                ))}
              </td>
              <td className="border border-gray-300 p-2 text-right font-semibold">₹{data.totals.totalSalaryExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold">Deposits</td>
              <td className="border border-gray-300 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 pl-6">RD: ₹{data.deposits.toLocaleString()}</td>
              <td className="border border-gray-300 p-2 text-right font-semibold">₹{data.deposits.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-semibold">Repairs & Maintenance</td>
              <td className="border border-gray-300 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 pl-6">
                {data.repairMaintenance.filter(item => item.amount > 0).map((item, index, filteredArray) => (
                  <div key={item.id}>
                    {item.type}: ₹{item.amount.toLocaleString()}
                    {index < filteredArray.length - 1 && <br />}
                  </div>
                ))}
              </td>
              <td className="border border-gray-300 p-2 text-right font-semibold">₹{data.totals.totalRepairMaintenance.toLocaleString()}</td>
            </tr>
            <tr className="bg-green-50">
              <td className="border border-gray-300 p-2 font-bold">Net Profit</td>
              <td className="border border-gray-300 p-2 text-right font-bold">₹{data.totals.netProfit.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Overdue</td>
              <td className="border border-gray-300 p-2 text-right">₹{data.totals.overdue.toLocaleString()}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="border border-gray-300 p-2 font-bold">Net Balance</td>
              <td className="border border-gray-300 p-2 text-right font-bold">₹{data.totals.netBalance.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Information */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 bg-gray-100 p-2">Additional Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">External Data Integration</h4>
            <ul className="space-y-1 text-sm">
              <li>Total Stock Value: ₹{data.accountsData.totalStockValue.toLocaleString()}</li>
              <li>Vendor Payments: ₹{data.accountsData.totalVendorPayments.toLocaleString()}</li>
              <li>Sub-Contractor Payments: ₹{data.accountsData.totalSubContractorPayments.toLocaleString()}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Performance Metrics</h4>
            <ul className="space-y-1 text-sm">
              <li>Total Bookings: {data.accountsData.totalBookings}</li>
              <li>Expense Ratio: {calculatePercentage(data.totals.totalExpenses, data.totals.totalRevenue)}%</li>
              <li>Profit Margin: {calculatePercentage(data.totals.netProfit, data.totals.totalRevenue)}%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>This is a system-generated report from MASTERKEY Financial Management System</p>
        <p>Report generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};
