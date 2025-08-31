
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Package, AlertTriangle, Trash2, Search } from "lucide-react";
import { AddStockModal } from "@/components/modals/AddStockModal";
import { EditStockModal } from "@/components/modals/EditStockModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  minimum_stock: number;
  cost_per_unit: number;
  total_value: number;
  unit: string;
  supplier: string;
  last_updated: string;
}

const Stocks = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('item_name');

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast.error('Failed to fetch stock items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Stock item deleted successfully');
      fetchStockItems();
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast.error('Failed to delete stock item');
    }
  };

  const filteredStockItems = stockItems.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockItems = filteredStockItems.filter(item => item.quantity <= item.minimum_stock);
  const totalValue = filteredStockItems.reduce((sum, item) => sum + (item.total_value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Stock Management</h1>
          <AddStockModal onStockAdded={fetchStockItems} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xl font-bold">{stockItems.length}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="text-xl font-bold text-red-600">{lowStockItems.length}</p>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-green-600">₹{totalValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Low Stock Alerts: {lowStockItems.length} items</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stock items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filteredStockItems.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.item_name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <Badge 
                  variant={item.quantity <= item.minimum_stock ? 'destructive' : 'default'}
                  className={item.quantity <= item.minimum_stock ? '' : 'bg-green-100 text-green-800'}
                >
                  {item.quantity <= item.minimum_stock ? 'Low Stock' : 'In Stock'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Stock:</span>
                  <span className="font-medium">{item.minimum_stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost/Unit:</span>
                  <span className="font-medium">₹{item.cost_per_unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium">₹{item.total_value?.toLocaleString()}</span>
                </div>
                {item.supplier && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-medium">{item.supplier}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <EditStockModal
                  stock={item}
                  onStockUpdated={fetchStockItems}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive flex-1"
                  onClick={() => handleDeleteStock(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredStockItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stock items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;
