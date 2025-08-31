
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddEmployeeModalProps {
  onEmployeeAdded: () => void;
}

export const AddEmployeeModal = ({ onEmployeeAdded }: AddEmployeeModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    department: "",
    position: "",
    salary: "",
    employment_type: "full-time",
    blood_group: "",
    status: "Active"
  });
  const [drivingLicense, setDrivingLicense] = useState<File | null>(null);
  const [aadharCard, setAadharCard] = useState<File | null>(null);

  const uploadDocument = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, file);

    if (error) throw error;
    return filePath;
  };

  const generateEmployeeId = async () => {
    try {
      // Get current count of employees to generate next ID
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      const nextId = (count || 0) + 1;
      const employeeId = `MK${String(nextId).padStart(3, '0')}`;
      
      // Check if this ID already exists
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('id', employeeId)
        .maybeSingle();

      if (existingEmployee) {
        // If ID exists, try incrementing until we find a free one
        let counter = nextId + 1;
        let newId = `MK${String(counter).padStart(3, '0')}`;
        
        while (true) {
          const { data: checkExists } = await supabase
            .from('employees')
            .select('id')
            .eq('id', newId)
            .maybeSingle();
          
          if (!checkExists) break;
          
          counter++;
          newId = `MK${String(counter).padStart(3, '0')}`;
        }
        
        return newId;
      }
      
      return employeeId;
    } catch (error) {
      console.error('Error generating employee ID:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.address || 
          !formData.age || !formData.department || !formData.position || !formData.salary) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (!drivingLicense || !aadharCard) {
        toast.error("Please upload both driving license and Aadhar card images");
        return;
      }

      // Generate employee ID
      const employeeId = await generateEmployeeId();

      // Upload documents
      const drivingLicenseUrl = await uploadDocument(drivingLicense, 'driving-licenses');
      const aadharCardUrl = await uploadDocument(aadharCard, 'aadhar-cards');

      // Insert employee data with generated ID
      const { error } = await supabase
        .from('employees')
        .insert({
          id: employeeId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          age: parseInt(formData.age),
          department: formData.department,
          position: formData.position,
          salary: parseFloat(formData.salary),
          employment_type: formData.employment_type,
          blood_group: formData.blood_group || null,
          driving_license_url: drivingLicenseUrl,
          aadhar_card_url: aadharCardUrl,
          status: formData.status
        });

      if (error) throw error;

      toast.success(`Employee added successfully with ID: ${employeeId}`);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        age: "",
        department: "",
        position: "",
        salary: "",
        employment_type: "full-time",
        blood_group: "",
        status: "Active"
      });
      setDrivingLicense(null);
      setAadharCard(null);
      
      setOpen(false);
      onEmployeeAdded();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2 text-sm sm:text-base">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Employee name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@example.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Age"
                min="18"
                max="65"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Complete address"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Cleaning Operations">Cleaning Operations</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Job position"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Monthly Salary *</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="Monthly salary in ₹"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type *</Label>
              <Select 
                value={formData.employment_type} 
                onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="blood_group">Blood Group</Label>
            <Select 
              value={formData.blood_group} 
              onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="drivingLicense">Driving License Image *</Label>
            <Input
              id="drivingLicense"
              type="file"
              accept="image/*"
              onChange={(e) => setDrivingLicense(e.target.files?.[0] || null)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="aadharCard">Aadhar Card Image *</Label>
            <Input
              id="aadharCard"
              type="file"
              accept="image/*"
              onChange={(e) => setAadharCard(e.target.files?.[0] || null)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
