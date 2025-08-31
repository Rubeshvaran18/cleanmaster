import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, DollarSign, Trash2, Phone, Mail, MapPin, Star, Download, FileText } from "lucide-react";
import { AddSubContractorModal } from "@/components/modals/AddSubContractorModal";
import { EditSubContractorModal } from "@/components/modals/EditSubContractorModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useExportData } from '@/hooks/useExportData';

interface SubContractor {
  id: string;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address: string;
  specialization: string;
  hourly_rate: number;
  rating: number;
  availability_status: string;
  created_at: string;
}

const SubContractors = () => {
  const [subContractors, setSubContractors] = useState<SubContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const { exportSubContractorsToExcel, exportSubContractorsToPDF } = useExportData();

  useEffect(() => {
    fetchSubContractors();
  }, []);

  const fetchSubContractors = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_contractors')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubContractors(data || []);
    } catch (error) {
      console.error('Error fetching sub-contractors:', error);
      toast.error('Failed to fetch sub-contractors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubContractor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sub_contractors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Sub-contractor deleted successfully');
      fetchSubContractors();
    } catch (error) {
      console.error('Error deleting sub-contractor:', error);
      toast.error('Failed to delete sub-contractor');
    }
  };

  const availableContractors = subContractors.filter(contractor => contractor.availability_status === 'Available');
  const averageRate = subContractors.length > 0 
    ? Math.round(subContractors.reduce((sum, contractor) => sum + (contractor.hourly_rate || 0), 0) / subContractors.length)
    : 0;

  const stats = [
    { label: "Total Sub-Contractors", value: subContractors.length.toString(), icon: Users, color: "text-blue-600" },
    { label: "Available", value: availableContractors.length.toString(), icon: UserCheck, color: "text-green-600" },
    { label: "Average Hourly Rate", value: `₹${averageRate}`, icon: DollarSign, color: "text-purple-600" }
  ];

  if (loading) {
    return <div className="space-y-6"><div className="p-6">Loading...</div></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sub-Contractors Management</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportSubContractorsToExcel(subContractors)}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportSubContractorsToPDF(subContractors)}
            className="flex items-center justify-center gap-2 text-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <AddSubContractorModal onSubContractorAdded={fetchSubContractors} />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-4">
                  <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  <div>
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sub-Contractors List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Sub-Contractors</h2>
        
        {subContractors.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-muted-foreground">No sub-contractors found</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first sub-contractor to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subContractors.map((contractor) => (
              <Card key={contractor.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold break-words">{contractor.name}</h3>
                          <Badge variant={
                            contractor.availability_status === 'Available' ? "default" :
                            contractor.availability_status === 'Busy' ? "secondary" : "destructive"
                          }>
                            {contractor.availability_status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{contractor.rating}</span>
                          </div>
                          {contractor.hourly_rate && (
                            <Badge variant="outline">₹{contractor.hourly_rate}/hr</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            {contractor.contact_person && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="break-words">{contractor.contact_person}</span>
                              </div>
                            )}
                            {contractor.phone_number && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{contractor.phone_number}</span>
                              </div>
                            )}
                            {contractor.email && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="break-all">{contractor.email}</span>
                              </div>
                            )}
                            {contractor.address && (
                              <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span className="flex-1 break-words">{contractor.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {contractor.specialization && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Specialization:</p>
                            <Badge variant="outline" className="text-xs">
                              {contractor.specialization}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center gap-2 flex-shrink-0">
                        <EditSubContractorModal
                          subContractor={contractor}
                          onSubContractorUpdated={fetchSubContractors}
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSubContractor(contractor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubContractors;
