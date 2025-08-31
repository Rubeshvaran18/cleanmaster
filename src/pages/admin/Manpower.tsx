
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ManpowerHiring {
  id: string;
  name: string;
  phone_number: string;
  age?: number;
  address?: string;
  source?: string;
  status: string;
  employee_type?: string;
  position?: string;
  joining_date?: string;
  interview_date?: string;
  created_at: string;
  updated_at: string;
}

interface ManpowerFormData {
  name: string;
  phone_number: string;
  age: string;
  address: string;
  source: string;
  status: string;
  employee_type: string;
  position: string;
  joining_date: string;
  interview_date: string;
}

const statusOptions = [
  "Joining today",
  "Not responding", 
  "Joined",
  "Yet to join"
];

const employeeTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Intern"
];

const positions = [
  "Cleaner",
  "Technician",
  "Supervisor",
  "Manager",
  "Assistant",
  "Driver",
  "Helper"
];

const Manpower = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ManpowerHiring | null>(null);
  const [formData, setFormData] = useState<ManpowerFormData>({
    name: "",
    phone_number: "",
    age: "",
    address: "",
    source: "",
    status: "Yet to join",
    employee_type: "",
    position: "",
    joining_date: "",
    interview_date: "",
  });

  const queryClient = useQueryClient();

  // Fetch manpower hiring records
  const { data: manpowerRecords = [], isLoading } = useQuery({
    queryKey: ['manpower-hiring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manpower_hiring')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ManpowerHiring[];
    }
  });

  // Add manpower record mutation
  const addManpowerMutation = useMutation({
    mutationFn: async (data: ManpowerFormData) => {
      const { error } = await supabase
        .from('manpower_hiring')
        .insert([{
          name: data.name,
          phone_number: data.phone_number,
          age: data.age ? parseInt(data.age) : null,
          address: data.address || null,
          source: data.source || null,
          status: data.status,
          employee_type: data.employee_type || null,
          position: data.position || null,
          joining_date: data.joining_date || null,
          interview_date: data.interview_date || null,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manpower-hiring'] });
      toast.success("Candidate added successfully!");
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add candidate");
      console.error('Error adding candidate:', error);
    }
  });

  // Update manpower record mutation
  const updateManpowerMutation = useMutation({
    mutationFn: async (data: ManpowerFormData & { id: string }) => {
      const { error } = await supabase
        .from('manpower_hiring')
        .update({
          name: data.name,
          phone_number: data.phone_number,
          age: data.age ? parseInt(data.age) : null,
          address: data.address || null,
          source: data.source || null,
          status: data.status,
          employee_type: data.employee_type || null,
          position: data.position || null,
          joining_date: data.joining_date || null,
          interview_date: data.interview_date || null,
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manpower-hiring'] });
      toast.success("Candidate updated successfully!");
      setIsEditModalOpen(false);
      setEditingRecord(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update candidate");
      console.error('Error updating candidate:', error);
    }
  });

  // Delete manpower record mutation
  const deleteManpowerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manpower_hiring')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manpower-hiring'] });
      toast.success("Candidate deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete candidate");
      console.error('Error deleting candidate:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      age: "",
      address: "",
      source: "",
      status: "Yet to join",
      employee_type: "",
      position: "",
      joining_date: "",
      interview_date: "",
    });
  };

  const handleAdd = () => {
    addManpowerMutation.mutate(formData);
  };

  const handleEdit = (record: ManpowerHiring) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      phone_number: record.phone_number,
      age: record.age?.toString() || "",
      address: record.address || "",
      source: record.source || "",
      status: record.status,
      employee_type: record.employee_type || "",
      position: record.position || "",
      joining_date: record.joining_date || "",
      interview_date: record.interview_date || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (editingRecord) {
      updateManpowerMutation.mutate({ ...formData, id: editingRecord.id });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      deleteManpowerMutation.mutate(id);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Joined": return "bg-green-100 text-green-800";
      case "Joining today": return "bg-blue-100 text-blue-800";
      case "Not responding": return "bg-red-100 text-red-800";
      case "Yet to join": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRecords = manpowerRecords.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phone_number.includes(searchTerm) ||
    (record.position && record.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter candidate name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number *</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="Enter phone number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          placeholder="Enter age"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="e.g., Job portal, Referral, Walk-in"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee_type">Employee Type</Label>
        <Select value={formData.employee_type} onValueChange={(value) => setFormData({ ...formData, employee_type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select employee type" />
          </SelectTrigger>
          <SelectContent>
            {employeeTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {positions.map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="joining_date">Joining Date</Label>
        <Input
          id="joining_date"
          type="date"
          value={formData.joining_date}
          onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interview_date">Interview Date</Label>
        <Input
          id="interview_date"
          type="date"
          value={formData.interview_date}
          onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter complete address"
          rows={3}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="p-6">Loading manpower data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">MANPOWER</h1>
          <p className="text-muted-foreground">Manage hiring and recruitment process</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>
                Add a new candidate to the hiring pipeline.
              </DialogDescription>
            </DialogHeader>
            {renderForm()}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAdd} 
                disabled={!formData.name || !formData.phone_number || addManpowerMutation.isPending}
              >
                {addManpowerMutation.isPending ? "Adding..." : "Add Candidate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, phone, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates ({filteredRecords.length})</CardTitle>
          <CardDescription>
            Manage your hiring pipeline and candidate information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Interview Date</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.phone_number}</TableCell>
                    <TableCell>{record.age || "-"}</TableCell>
                    <TableCell>{record.position || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.source || "-"}</TableCell>
                    <TableCell>
                      {record.interview_date ? new Date(record.interview_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      {record.joining_date ? new Date(record.joining_date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No candidates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Candidate</DialogTitle>
            <DialogDescription>
              Update candidate information and status.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!formData.name || !formData.phone_number || updateManpowerMutation.isPending}
            >
              {updateManpowerMutation.isPending ? "Updating..." : "Update Candidate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Manpower;
