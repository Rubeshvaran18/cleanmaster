import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package, Car, Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Asset {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_type: 'vehicle' | 'equipment' | 'material';
  taken_by: string | null;
  check_out_time: string | null;
  check_in_time: string | null;
  defects_damage: string | null;
  notes: string | null;
  status: 'available' | 'checked_out' | 'maintenance';
  created_at: string;
  updated_at: string;
}

const AssetTypeIcons = {
  vehicle: Car,
  equipment: Wrench,
  material: Package
};

const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetForm, setAssetForm] = useState({
    asset_id: '',
    asset_name: '',
    asset_type: 'equipment' as 'vehicle' | 'equipment' | 'material',
    taken_by: '',
    defects_damage: '',
    notes: '',
    status: 'available' as 'available' | 'checked_out' | 'maintenance'
  });

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets((data || []) as Asset[]);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .eq('status', 'Active');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const resetForm = () => {
    setAssetForm({
      asset_id: '',
      asset_name: '',
      asset_type: 'equipment',
      taken_by: '',
      defects_damage: '',
      notes: '',
      status: 'available'
    });
  };

  const handleAddAsset = async () => {
    try {
      if (!assetForm.asset_id || !assetForm.asset_name) {
        toast.error('Asset ID and name are required');
        return;
      }

      const { error } = await supabase
        .from('assets')
        .insert({
          ...assetForm,
          taken_by: assetForm.taken_by || null
        });

      if (error) throw error;

      toast.success('Asset added successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchAssets();
    } catch (error: any) {
      console.error('Error adding asset:', error);
      if (error.code === '23505') {
        toast.error('Asset ID already exists');
      } else {
        toast.error('Failed to add asset');
      }
    }
  };

  const handleEditAsset = async () => {
    if (!selectedAsset) return;

    try {
      const updateData: any = {
        ...assetForm,
        taken_by: assetForm.taken_by || null
      };

      // Set check-out/check-in times based on status
      if (assetForm.status === 'checked_out' && !selectedAsset.check_out_time) {
        updateData.check_out_time = new Date().toISOString();
      } else if (assetForm.status === 'available' && selectedAsset.status === 'checked_out') {
        updateData.check_in_time = new Date().toISOString();
        updateData.taken_by = null;
      }

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', selectedAsset.id);

      if (error) throw error;

      toast.success('Asset updated successfully');
      setIsEditModalOpen(false);
      setSelectedAsset(null);
      resetForm();
      fetchAssets();
    } catch (error: any) {
      console.error('Error updating asset:', error);
      if (error.code === '23505') {
        toast.error('Asset ID already exists');
      } else {
        toast.error('Failed to update asset');
      }
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast.success('Asset deleted successfully');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetForm({
      asset_id: asset.asset_id,
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      taken_by: asset.taken_by || '',
      defects_damage: asset.defects_damage || '',
      notes: asset.notes || '',
      status: asset.status
    });
    setIsEditModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'checked_out': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-3 w-3" />;
      case 'checked_out': return <Clock className="h-3 w-3" />;
      case 'maintenance': return <AlertTriangle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-6">Loading...</div>
      </div>
    );
  }

  const availableAssets = assets.filter(asset => asset.status === 'available');
  const checkedOutAssets = assets.filter(asset => asset.status === 'checked_out');
  const maintenanceAssets = assets.filter(asset => asset.status === 'maintenance');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold">{assets.length}</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asset_id">Asset ID</Label>
                    <Input
                      id="asset_id"
                      placeholder="MKA001"
                      value={assetForm.asset_id}
                      onChange={(e) => setAssetForm({ ...assetForm, asset_id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="asset_type">Asset Type</Label>
                    <Select value={assetForm.asset_type} onValueChange={(value: any) => setAssetForm({ ...assetForm, asset_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="asset_name">Asset Name</Label>
                  <Input
                    id="asset_name"
                    value={assetForm.asset_name}
                    onChange={(e) => setAssetForm({ ...assetForm, asset_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={assetForm.status} onValueChange={(value: any) => setAssetForm({ ...assetForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {assetForm.status === 'checked_out' && (
                  <div>
                    <Label htmlFor="taken_by">Taken By</Label>
                    <Select value={assetForm.taken_by} onValueChange={(value) => setAssetForm({ ...assetForm, taken_by: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.name}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="defects_damage">Defects/Damage</Label>
                  <Textarea
                    id="defects_damage"
                    value={assetForm.defects_damage}
                    onChange={(e) => setAssetForm({ ...assetForm, defects_damage: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={assetForm.notes}
                    onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddAsset} className="w-full">
                  Add Asset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{availableAssets.length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{checkedOutAssets.length}</p>
                <p className="text-sm text-muted-foreground">Checked Out</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{maintenanceAssets.length}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <div className="space-y-4">
        {assets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No assets found</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first asset to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => {
              const AssetIcon = AssetTypeIcons[asset.asset_type];
              return (
                <Card key={asset.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <AssetIcon className="h-6 w-6 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{asset.asset_name}</h3>
                          <Badge className={getStatusColor(asset.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(asset.status)}
                              <span className="capitalize">{asset.status}</span>
                            </div>
                          </Badge>
                          <Badge variant="outline">{asset.asset_id}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Type: <span className="capitalize">{asset.asset_type}</span></p>
                          {asset.taken_by && (
                            <p>Taken by: <span className="font-medium">{asset.taken_by}</span></p>
                          )}
                          {asset.check_out_time && (
                            <p>Checked out: {new Date(asset.check_out_time).toLocaleString()}</p>
                          )}
                          {asset.check_in_time && (
                            <p>Checked in: {new Date(asset.check_in_time).toLocaleString()}</p>
                          )}
                          {asset.defects_damage && (
                            <p className="text-red-600">Defects: {asset.defects_damage}</p>
                          )}
                          {asset.notes && (
                            <p>Notes: {asset.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(asset)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{asset.asset_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAsset(asset.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_asset_id">Asset ID</Label>
                <Input
                  id="edit_asset_id"
                  value={assetForm.asset_id}
                  onChange={(e) => setAssetForm({ ...assetForm, asset_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_asset_type">Asset Type</Label>
                <Select value={assetForm.asset_type} onValueChange={(value: any) => setAssetForm({ ...assetForm, asset_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit_asset_name">Asset Name</Label>
              <Input
                id="edit_asset_name"
                value={assetForm.asset_name}
                onChange={(e) => setAssetForm({ ...assetForm, asset_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select value={assetForm.status} onValueChange={(value: any) => setAssetForm({ ...assetForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assetForm.status === 'checked_out' && (
              <div>
                <Label htmlFor="edit_taken_by">Taken By</Label>
                <Select value={assetForm.taken_by} onValueChange={(value) => setAssetForm({ ...assetForm, taken_by: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="edit_defects_damage">Defects/Damage</Label>
              <Textarea
                id="edit_defects_damage"
                value={assetForm.defects_damage}
                onChange={(e) => setAssetForm({ ...assetForm, defects_damage: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit_notes">Notes (Optional)</Label>
              <Textarea
                id="edit_notes"
                value={assetForm.notes}
                onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
              />
            </div>

            <Button onClick={handleEditAsset} className="w-full">
              Update Asset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assets;