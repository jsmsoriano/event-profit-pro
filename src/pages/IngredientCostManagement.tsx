import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, DollarSign, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit_type: string;
  cost_per_unit: number;
  current_quantity: number;
  minimum_stock: number;
  supplier_id?: string;
  expiry_date?: string;
  storage_location?: string;
}

interface IngredientFormData {
  name: string;
  category: string;
  unit_type: string;
  cost_per_unit: number;
  current_quantity: number;
  minimum_stock: number;
  storage_location: string;
  expiry_date: string;
}

const initialFormData: IngredientFormData = {
  name: '',
  category: 'proteins',
  unit_type: 'lb',
  cost_per_unit: 0,
  current_quantity: 0,
  minimum_stock: 0,
  storage_location: '',
  expiry_date: '',
};

const categories = [
  { value: 'proteins', label: 'Proteins' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains & Starches' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'seasonings', label: 'Seasonings & Spices' },
  { value: 'oils', label: 'Oils & Fats' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'other', label: 'Other' },
];

const units = [
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'each', label: 'Each' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'quart', label: 'Quart' },
  { value: 'cup', label: 'Cup' },
  { value: 'tbsp', label: 'Tablespoon' },
  { value: 'tsp', label: 'Teaspoon' },
];

export default function IngredientCostManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [formData, setFormData] = useState<IngredientFormData>(initialFormData);
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;

      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      toast.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    if (filter === 'all') return true;
    return ingredient.category === filter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.cost_per_unit <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ingredientData = {
        ...formData,
        user_id: user.id,
        expiry_date: formData.expiry_date || null,
      };

      if (editingIngredient) {
        const { error } = await supabase
          .from('inventory_items')
          .update(ingredientData)
          .eq('id', editingIngredient);

        if (error) throw error;
        toast.success('Ingredient updated successfully');
      } else {
        const { error } = await supabase
          .from('inventory_items')
          .insert(ingredientData);

        if (error) throw error;
        toast.success('Ingredient created successfully');
      }
      
      handleCloseDialog();
      loadIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast.error('Failed to save ingredient');
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category || 'proteins',
      unit_type: ingredient.unit_type || 'lb',
      cost_per_unit: ingredient.cost_per_unit || 0,
      current_quantity: ingredient.current_quantity || 0,
      minimum_stock: ingredient.minimum_stock || 0,
      storage_location: ingredient.storage_location || '',
      expiry_date: ingredient.expiry_date || '',
    });
    setEditingIngredient(ingredient.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (ingredientId: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', ingredientId);

      if (error) throw error;
      
      toast.success('Ingredient deleted successfully');
      loadIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Failed to delete ingredient');
    }
  };

  const handleCloseDialog = () => {
    setFormData(initialFormData);
    setEditingIngredient(null);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: keyof IngredientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTotalValue = () => {
    return ingredients.reduce((total, ingredient) => {
      return total + (ingredient.current_quantity * ingredient.cost_per_unit);
    }, 0);
  };

  const getLowStockCount = () => {
    return ingredients.filter(ingredient => 
      ingredient.current_quantity <= ingredient.minimum_stock
    ).length;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ingredients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ingredient Cost Management</h1>
          <p className="text-muted-foreground">Track ingredient costs and inventory for accurate menu pricing</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Ingredient Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Chicken Breast"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit_type">Unit Type</Label>
                  <Select 
                    value={formData.unit_type} 
                    onValueChange={(value) => handleInputChange('unit_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_per_unit">Cost per Unit *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_per_unit}
                    onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_quantity">Current Quantity</Label>
                  <Input
                    id="current_quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.current_quantity}
                    onChange={(e) => handleInputChange('current_quantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimum_stock">Minimum Stock</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) => handleInputChange('minimum_stock', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  value={formData.storage_location}
                  onChange={(e) => handleInputChange('storage_location', e.target.value)}
                  placeholder="e.g., Walk-in Cooler, Dry Storage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIngredient ? 'Update Ingredient' : 'Create Ingredient'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ingredients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalValue().toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{getLowStockCount()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(ingredients.map(i => i.category)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Ingredients List */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients ({filteredIngredients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIngredients.length > 0 ? (
            <div className="space-y-4">
              {filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                      <Badge variant="outline">${ingredient.cost_per_unit}/{ingredient.unit_type}</Badge>
                      {ingredient.current_quantity <= ingredient.minimum_stock && (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Category: {categories.find(c => c.value === ingredient.category)?.label}</span>
                      <span>Qty: {ingredient.current_quantity} {ingredient.unit_type}</span>
                      {ingredient.storage_location && (
                        <span>Location: {ingredient.storage_location}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(ingredient)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(ingredient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No ingredients found. Add your first ingredient to get started.
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}