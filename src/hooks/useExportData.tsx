
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const useExportData = () => {
  
  const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data available to export');
        return;
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const maxWidths: number[] = [];
      const headers = Object.keys(data[0] || {});
      
      headers.forEach((header, colIndex) => {
        const headerLength = header.length;
        const maxDataLength = Math.max(...data.map(row => 
          String(row[header] || '').length
        ));
        maxWidths[colIndex] = Math.max(headerLength, maxDataLength, 10);
      });
      
      worksheet['!cols'] = maxWidths.map(width => ({ width: Math.min(width, 50) }));
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      
      toast.success(`Excel file "${filename}.xlsx" downloaded successfully`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const exportToPDF = (data: any[], filename: string, title: string, columns: { header: string; dataKey: string }[]) => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data available to export');
        return;
      }

      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(title, 14, 20);
      
      // Add generation date
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Prepare table data with proper string conversion
      const tableData = data.map(item => 
        columns.map(col => {
          const value = item[col.dataKey];
          if (value === null || value === undefined) {
            return '';
          }
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          return String(value);
        })
      );
      
      // Create table
      pdf.autoTable({
        head: [columns.map(col => col.header)],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 40, right: 14, bottom: 20, left: 14 },
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = (pdf as any).internal.getNumberOfPages();
          const pageNumber = `Page ${data.pageCount} of ${pageCount}`;
          pdf.setFontSize(8);
          pdf.text(pageNumber, pdf.internal.pageSize.width - 40, pdf.internal.pageSize.height - 10);
        }
      });
      
      pdf.save(`${filename}.pdf`);
      toast.success(`PDF file "${filename}.pdf" downloaded successfully`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export PDF file');
    }
  };

  const exportEmployeesToExcel = (employees: any[]) => {
    if (!employees || employees.length === 0) {
      toast.error('No employees data to export');
      return;
    }
    
    const exportData = employees.map(emp => ({
      'Name': emp.name || '',
      'Position': emp.position || '',
      'Employment Type': emp.employment_type || '',
      'Department': emp.department || '',
      'Phone': emp.phone_number || '',
      'Email': emp.email || '',
      'Address': emp.address || '',
      'Salary': emp.salary || '',
      'Hire Date': emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '',
      'Status': emp.status || '',
      'Experience': emp.experience || '',
      'Skills': Array.isArray(emp.skills) ? emp.skills.join(', ') : emp.skills || ''
    }));
    
    exportToExcel(exportData, 'employees_data', 'Employees');
  };

  const exportEmployeesToPDF = (employees: any[]) => {
    if (!employees || employees.length === 0) {
      toast.error('No employees data to export');
      return;
    }
    
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Position', dataKey: 'position' },
      { header: 'Type', dataKey: 'employment_type' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Phone', dataKey: 'phone_number' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Salary', dataKey: 'salary' }
    ];
    
    exportToPDF(employees, 'employees_data', 'Employees Report', columns);
  };

  const exportVendorsToExcel = (vendors: any[]) => {
    if (!vendors || vendors.length === 0) {
      toast.error('No vendors data to export');
      return;
    }
    
    const exportData = vendors.map(vendor => ({
      'Name': vendor.name || '',
      'Contact Person': vendor.contact_person || '',
      'Phone': vendor.phone_number || '',
      'Email': vendor.email || '',
      'Address': vendor.address || '',
      'Services': Array.isArray(vendor.services_provided) ? vendor.services_provided.join(', ') : vendor.services_provided || '',
      'Rating': vendor.rating || '',
      'Status': vendor.status || '',
      'Created Date': vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ''
    }));
    
    exportToExcel(exportData, 'vendors_data', 'Vendors');
  };

  const exportVendorsToPDF = (vendors: any[]) => {
    if (!vendors || vendors.length === 0) {
      toast.error('No vendors data to export');
      return;
    }
    
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Contact Person', dataKey: 'contact_person' },
      { header: 'Phone', dataKey: 'phone_number' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Services', dataKey: 'services_provided' },
      { header: 'Rating', dataKey: 'rating' },
      { header: 'Status', dataKey: 'status' }
    ];
    
    exportToPDF(vendors, 'vendors_data', 'Vendors Report', columns);
  };

  const exportSubContractorsToExcel = (subContractors: any[]) => {
    if (!subContractors || subContractors.length === 0) {
      toast.error('No sub-contractors data to export');
      return;
    }
    
    const exportData = subContractors.map(contractor => ({
      'Name': contractor.name || '',
      'Contact Person': contractor.contact_person || '',
      'Phone': contractor.phone_number || '',
      'Email': contractor.email || '',
      'Address': contractor.address || '',
      'Specialization': contractor.specialization || '',
      'Hourly Rate': contractor.hourly_rate || '',
      'Rating': contractor.rating || '',
      'Availability': contractor.availability_status || '',
      'Created Date': contractor.created_at ? new Date(contractor.created_at).toLocaleDateString() : ''
    }));
    
    exportToExcel(exportData, 'subcontractors_data', 'Sub-Contractors');
  };

  const exportSubContractorsToPDF = (subContractors: any[]) => {
    if (!subContractors || subContractors.length === 0) {
      toast.error('No sub-contractors data to export');
      return;
    }
    
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Contact Person', dataKey: 'contact_person' },
      { header: 'Phone', dataKey: 'phone_number' },
      { header: 'Specialization', dataKey: 'specialization' },
      { header: 'Rate/hr', dataKey: 'hourly_rate' },
      { header: 'Rating', dataKey: 'rating' },
      { header: 'Availability', dataKey: 'availability_status' }
    ];
    
    exportToPDF(subContractors, 'subcontractors_data', 'Sub-Contractors Report', columns);
  };

  const exportCustomersToExcel = (customers: any[]) => {
    if (!customers || customers.length === 0) {
      toast.error('No customers data to export');
      return;
    }
    
    const exportData = customers.map(customer => ({
      'Name': customer.name || customer.customer_name || '',
      'Phone': customer.phone || customer.customer_phone || '',
      'Email': customer.email || customer.customer_email || '',
      'Address': customer.address || '',
      'Customer Type': customer.customer_type || '',
      'Total Bookings': customer.total_bookings || '',
      'Total Spent': customer.total_spent || '',
      'Last Booking': customer.last_booking_date ? new Date(customer.last_booking_date).toLocaleDateString() : '',
      'Loyalty Points': customer.total_points || customer.loyalty_points || '',
      'Status': customer.status || 'Active',
      'Created Date': customer.created_at ? new Date(customer.created_at).toLocaleDateString() : ''
    }));
    
    exportToExcel(exportData, 'customers_data', 'Customers');
  };

  const exportCustomersToPDF = (customers: any[]) => {
    if (!customers || customers.length === 0) {
      toast.error('No customers data to export');
      return;
    }
    
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Type', dataKey: 'customer_type' },
      { header: 'Bookings', dataKey: 'total_bookings' },
      { header: 'Total Spent', dataKey: 'total_spent' },
      { header: 'Points', dataKey: 'total_points' },
      { header: 'Status', dataKey: 'status' }
    ];
    
    const processedCustomers = customers.map(customer => ({
      ...customer,
      name: customer.name || customer.customer_name,
      phone: customer.phone || customer.customer_phone,
      email: customer.email || customer.customer_email
    }));
    
    exportToPDF(processedCustomers, 'customers_data', 'Customers Report', columns);
  };

  const exportCustomerRecordsToExcel = (customerRecords: any[]) => {
    if (!customerRecords || customerRecords.length === 0) {
      toast.error('No customer records data to export');
      return;
    }
    
    const exportData = customerRecords.map(record => ({
      'Name': record.name || '',
      'Phone': record.phone || '',
      'Email': record.email || '',
      'Address': record.address || '',
      'Booking Date': record.booking_date ? new Date(record.booking_date).toLocaleDateString() : '',
      'Task Type': record.task_type || '',
      'Amount': record.amount || '',
      'Amount Paid': record.amount_paid || '',
      'Payment Status': record.payment_status || '',
      'Discount Points': record.discount_points || '',
      'Source': record.source || '',
      'Task Done By': Array.isArray(record.task_done_by) ? record.task_done_by.join(', ') : record.task_done_by || '',
      'Customer Rating': record.customer_rating || '',
      'Notes': record.customer_notes || '',
      'Created Date': record.created_at ? new Date(record.created_at).toLocaleDateString() : ''
    }));
    
    exportToExcel(exportData, 'customer_records_data', 'Customer Records');
  };

  const exportCustomerRecordsToPDF = (customerRecords: any[]) => {
    if (!customerRecords || customerRecords.length === 0) {
      toast.error('No customer records data to export');
      return;
    }
    
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Task Type', dataKey: 'task_type' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Payment Status', dataKey: 'payment_status' },
      { header: 'Rating', dataKey: 'customer_rating' },
      { header: 'Booking Date', dataKey: 'booking_date' }
    ];
    
    const processedRecords = customerRecords.map(record => ({
      ...record,
      booking_date: record.booking_date ? new Date(record.booking_date).toLocaleDateString() : ''
    }));
    
    exportToPDF(processedRecords, 'customer_records_data', 'Customer Records Report', columns);
  };

  const exportAllData = async () => {
    try {
      toast.info('Preparing comprehensive export...');
      
      // This would require fetching all data from different sources
      // For now, we'll show a message that individual exports should be used
      toast.info('Please use individual export buttons on each page for best results');
    } catch (error) {
      console.error('Error exporting all data:', error);
      toast.error('Failed to export all data');
    }
  };

  return {
    exportToExcel,
    exportToPDF,
    exportEmployeesToExcel,
    exportEmployeesToPDF,
    exportVendorsToExcel,
    exportVendorsToPDF,
    exportSubContractorsToExcel,
    exportSubContractorsToPDF,
    exportCustomersToExcel,
    exportCustomersToPDF,
    exportCustomerRecordsToExcel,
    exportCustomerRecordsToPDF,
    exportAllData
  };
};
