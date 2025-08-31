
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Plus, Trash2, Edit, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface InspectionRecord {
  id?: string;
  booking_id?: string;
  customer_name: string;
  address: string;
  phone_number: string;
  service_name?: string;
  inspected_by?: string;
  date?: string;
  scheduled_date?: string;
  time_taken?: string;
  notes?: string;
  status?: string;
  created_from_booking?: boolean;
  created_at?: string;
}

const Inspection = () => {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentInspection, setCurrentInspection] = useState<InspectionRecord>({
    customer_name: '',
    address: '',
    phone_number: '',
    service_name: '',
    inspected_by: '',
    date: '',
    time_taken: '',
    notes: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      // Get inspections from localStorage since we don't have the inspections table in the database
      const storedInspections = localStorage.getItem('inspections');
      const inspectionData = storedInspections ? JSON.parse(storedInspections) : [];
      setInspections(inspectionData);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof InspectionRecord, value: string) => {
    setCurrentInspection(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInspection = async () => {
    if (!currentInspection.customer_name || !currentInspection.address || !currentInspection.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newInspection = {
        ...currentInspection,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        status: currentInspection.status || 'Pending'
      };

      const existingInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      existingInspections.unshift(newInspection);
      localStorage.setItem('inspections', JSON.stringify(existingInspections));

      setInspections(existingInspections);
      setCurrentInspection({
        customer_name: '',
        address: '',
        phone_number: '',
        service_name: '',
        inspected_by: '',
        date: '',
        time_taken: '',
        notes: '',
        status: 'Pending'
      });
      toast.success('Inspection record added successfully');
    } catch (error) {
      console.error('Error adding inspection:', error);
      toast.error('Failed to add inspection record');
    }
  };

  const updateInspectionStatus = async (id: string, status: string) => {
    try {
      const existingInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      const updatedInspections = existingInspections.map((inspection: InspectionRecord) =>
        inspection.id === id ? { ...inspection, status } : inspection
      );
      localStorage.setItem('inspections', JSON.stringify(updatedInspections));

      setInspections(updatedInspections);
      toast.success('Inspection status updated');
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast.error('Failed to update inspection status');
    }
  };

  const removeInspection = async (id: string) => {
    try {
      const existingInspections = JSON.parse(localStorage.getItem('inspections') || '[]');
      const filteredInspections = existingInspections.filter((inspection: InspectionRecord) => inspection.id !== id);
      localStorage.setItem('inspections', JSON.stringify(filteredInspections));

      setInspections(filteredInspections);
      toast.success('Inspection record removed');
    } catch (error) {
      console.error('Error removing inspection:', error);
      toast.error('Failed to remove inspection record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading inspections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inspection Management</h1>
      </div>

      {/* Add New Inspection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Inspection Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={currentInspection.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={currentInspection.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={currentInspection.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="serviceName">Service Type</Label>
              <Input
                id="serviceName"
                value={currentInspection.service_name || ''}
                onChange={(e) => handleInputChange('service_name', e.target.value)}
                placeholder="Service type"
              />
            </div>

            <div>
              <Label htmlFor="inspectedBy">Inspected By</Label>
              <Input
                id="inspectedBy"
                value={currentInspection.inspected_by || ''}
                onChange={(e) => handleInputChange('inspected_by', e.target.value)}
                placeholder="Inspector name"
              />
            </div>

            <div>
              <Label htmlFor="date">Inspection Date</Label>
              <Input
                id="date"
                type="date"
                value={currentInspection.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="timeTaken">Time Taken</Label>
              <Input
                id="timeTaken"
                value={currentInspection.time_taken || ''}
                onChange={(e) => handleInputChange('time_taken', e.target.value)}
                placeholder="e.g., 2 hours, 1.5 hours"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={currentInspection.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={currentInspection.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional inspection notes or observations"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={addInspection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Inspection Record
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Records ({inspections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No inspection records found. Use the form above to add your first inspection or schedule inspections from bookings.
            </p>
          ) : (
            <div className="space-y-4">
              {inspections.map((inspection) => (
                <div key={inspection.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{inspection.customer_name}</h3>
                        {inspection.created_from_booking && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            From Booking
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Phone: {inspection.phone_number}</p>
                      {inspection.service_name && (
                        <p className="text-sm text-muted-foreground">Service: {inspection.service_name}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select 
                        value={inspection.status || 'Pending'} 
                        onValueChange={(value) => updateInspectionStatus(inspection.id!, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInspection(inspection.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Address:</strong></p>
                      <p className="text-muted-foreground">{inspection.address}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {inspection.inspected_by && (
                        <p><strong>Inspected By:</strong> {inspection.inspected_by}</p>
                      )}
                      {inspection.date && (
                        <p><strong>Date:</strong> {new Date(inspection.date).toLocaleDateString()}</p>
                      )}
                      {inspection.scheduled_date && (
                        <p><strong>Scheduled Date:</strong> {new Date(inspection.scheduled_date).toLocaleDateString()}</p>
                      )}
                      {inspection.time_taken && (
                        <p><strong>Time Taken:</strong> {inspection.time_taken}</p>
                      )}
                    </div>
                  </div>
                  
                  {inspection.notes && (
                    <div className="mt-3">
                      <p><strong>Notes:</strong></p>
                      <p className="text-muted-foreground text-sm">{inspection.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inspection;
