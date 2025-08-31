import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, UserCheck, Trash2, Phone, Mail, MapPin, Download, FileText } from "lucide-react";
import { AddVendorModal } from "@/components/modals/AddVendorModal";
import { EditVendorModal } from "@/components/modals/EditVendorModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useExportData } from '@/hooks/useExportData';

interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  address: string;
  services_provided: string[];
  rating: number;
  status: string;
  created_at: string;
}

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { exportVendorsToExcel, exportVendorsToPDF } = useExportData();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const activeVendors = vendors.filter(vendor => vendor.status === 'Active');
  const averageRating = vendors.length > 0 
    ? (vendors.reduce((sum, vendor) => sum + vendor.rating, 0) / vendors.length).toFixed(1)
    : "0.0";

  const stats = [
    { label: "Total Vendors", value: vendors.length.toString(), icon: Users, color: "text-blue-600" },
    { label: "Active Vendors", value: activeVendors.length.toString(), icon: UserCheck, color: "text-green-600" },
    { label: "Average Rating", value: averageRating, icon: Star, color: "text-yellow-600" }
  ];

  if (loading) {
    return <div className="space-y-6"><div className="p-6">Loading...</div></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendors Management</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportVendorsToExcel(vendors)}
            className="flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-50 text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportVendorsToPDF(vendors)}
            className="flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-50 text-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <AddVendorModal onVendorAdded={fetchVendors} />
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

      {/* Vendors List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Vendors</h2>
        
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-muted-foreground">No vendors found</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first vendor to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold break-words">{vendor.name}</h3>
                          <Badge variant={vendor.status === 'Active' ? "default" : "secondary"}>
                            {vendor.status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{vendor.rating}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            {vendor.contact_person && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="break-words">{vendor.contact_person}</span>
                              </div>
                            )}
                            {vendor.phone_number && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{vendor.phone_number}</span>
                              </div>
                            )}
                            {vendor.email && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="break-all">{vendor.email}</span>
                              </div>
                            )}
                            {vendor.address && (
                              <div className="flex items-start space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span className="flex-1 break-words">{vendor.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {vendor.services_provided && vendor.services_provided.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Services:</p>
                            <div className="flex flex-wrap gap-2">
                              {vendor.services_provided.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center gap-2 flex-shrink-0">
                        <EditVendorModal
                          vendor={vendor}
                          onVendorUpdated={fetchVendors}
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteVendor(vendor.id)}
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

export default Vendors;
