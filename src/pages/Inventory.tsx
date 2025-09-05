import { useState } from 'react';
import { Plus, Package, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

export default function Inventory() {
  const { inventory, suppliers, loading, createInventoryItem, updateInventoryItem, createSupplier, getLowStockItems, getExpiringItems } = useInventory();
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'general',
    unit_type: 'piece',
    current_quantity: '0',
    minimum_stock: '0',
    cost_per_unit: '0',
    supplier_id: '',
    storage_location: '',
    expiry_date: ''
  });

  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    payment_terms: '',
    rating: '5',
    is_active: true
  });

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      ...itemFormData,
      current_quantity: parseFloat(itemFormData.current_quantity) || 0,
      minimum_stock: parseFloat(itemFormData.minimum_stock) || 0,
      cost_per_unit: parseFloat(itemFormData.cost_per_unit) || 0,
      supplier_id: itemFormData.supplier_id || undefined,
      expiry_date: itemFormData.expiry_date || undefined
    };

    if (editingItem) {
      await updateInventoryItem(editingItem.id, itemData);
    } else {
      await createInventoryItem(itemData);
    }

    setIsItemDialogOpen(false);
    resetItemForm();
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData = {
      ...supplierFormData,
      rating: parseInt(supplierFormData.rating) || 5
    };

    await createSupplier(supplierData);
    setIsSupplierDialogOpen(false);
    resetSupplierForm();
  };

  const resetItemForm = () => {
    setItemFormData({
      name: '',
      category: 'general',
      unit_type: 'piece',
      current_quantity: '0',
      minimum_stock: '0',
      cost_per_unit: '0',
      supplier_id: '',
      storage_location: '',
      expiry_date: ''
    });
    setEditingItem(null);
  };

  const resetSupplierForm = () => {
    setSupplierFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      payment_terms: '',
      rating: '5',
      is_active: true
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      protein: 'bg-red-100 text-red-800',
      vegetable: 'bg-green-100 text-green-800',
      dairy: 'bg-blue-100 text-blue-800',
      spice: 'bg-yellow-100 text-yellow-800',
      equipment: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems();
  const totalValue = inventory.reduce((sum, item) => sum + (item.current_quantity * item.cost_per_unit), 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading inventory...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track your ingredients and supplies</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetSupplierForm}>
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSupplierSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="supplier-name">Name</Label>
                  <Input
                    id="supplier-name"
                    value={supplierFormData.name}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    value={supplierFormData.contact_person}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, contact_person: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-email">Email</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={supplierFormData.email}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier-phone">Phone</Label>
                  <Input
                    id="supplier-phone"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsSupplierDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Supplier</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetItemForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item-name">Name</Label>
                    <Input
                      id="item-name"
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={itemFormData.category} onValueChange={(value) => setItemFormData({ ...itemFormData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protein">Protein</SelectItem>
                        <SelectItem value="vegetable">Vegetable</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="spice">Spice</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current-quantity">Current Quantity</Label>
                    <Input
                      id="current-quantity"
                      type="number"
                      step="0.01"
                      value={itemFormData.current_quantity}
                      onChange={(e) => setItemFormData({ ...itemFormData, current_quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum-stock">Minimum Stock</Label>
                    <Input
                      id="minimum-stock"
                      type="number"
                      step="0.01"
                      value={itemFormData.minimum_stock}
                      onChange={(e) => setItemFormData({ ...itemFormData, minimum_stock: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit-type">Unit Type</Label>
                    <Select value={itemFormData.unit_type} onValueChange={(value) => setItemFormData({ ...itemFormData, unit_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="lb">Pound</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="gallon">Gallon</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost-per-unit">Cost per Unit ($)</Label>
                    <Input
                      id="cost-per-unit"
                      type="number"
                      step="0.01"
                      value={itemFormData.cost_per_unit}
                      onChange={(e) => setItemFormData({ ...itemFormData, cost_per_unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select value={itemFormData.supplier_id} onValueChange={(value) => setItemFormData({ ...itemFormData, supplier_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storage-location">Storage Location</Label>
                    <Input
                      id="storage-location"
                      value={itemFormData.storage_location}
                      onChange={(e) => setItemFormData({ ...itemFormData, storage_location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={itemFormData.expiry_date}
                      onChange={(e) => setItemFormData({ ...itemFormData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update' : 'Add'} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingItem(item);
                        setItemFormData({
                          name: item.name,
                          category: item.category,
                          unit_type: item.unit_type,
                          current_quantity: item.current_quantity.toString(),
                          minimum_stock: item.minimum_stock.toString(),
                          cost_per_unit: item.cost_per_unit.toString(),
                          supplier_id: item.supplier_id || '',
                          storage_location: item.storage_location || '',
                          expiry_date: item.expiry_date || ''
                        });
                        setIsItemDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{item.current_quantity} {item.unit_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Min Stock:</span>
                      <span className={item.current_quantity <= item.minimum_stock ? 'text-red-600 font-medium' : ''}>
                        {item.minimum_stock} {item.unit_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cost/Unit:</span>
                      <span className="font-medium">${item.cost_per_unit}</span>
                    </div>
                    {item.expiry_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expires:</span>
                        <span className={new Date(item.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-red-600 font-medium' : ''}>
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="low-stock">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <Card key={item.id} className="border-yellow-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current:</span>
                      <span className="font-medium text-red-600">{item.current_quantity} {item.unit_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Minimum:</span>
                      <span className="font-medium">{item.minimum_stock} {item.unit_type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="expiring">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringItems.map((item) => (
              <Card key={item.id} className="border-red-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="destructive">Expiring</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <span className="font-medium text-red-600">
                        {item.expiry_date && new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{item.current_quantity} {item.unit_type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}