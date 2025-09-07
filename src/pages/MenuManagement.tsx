import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Leaf, DollarSign } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { toast } from 'sonner';

interface DishFormData {
  name: string;
  description: string;
  base_price_per_guest: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_active: boolean;
  category: string;
  event_type?: string;
  protein_types?: string[];
  side_types?: string[];
  vegetable_type?: string;
  appetizer_type?: string;
  // Hibachi dinner specific fields
  chicken_count?: number;
  steak_count?: number;
  shrimp_count?: number;
  protein_upgrades?: Array<{
    name: string;
    price: number;
  }>;
}

const initialFormData: DishFormData = {
  name: '',
  description: '',
  base_price_per_guest: 0,
  is_vegetarian: false,
  is_vegan: false,
  is_gluten_free: false,
  is_active: true,
  category: 'protein',
  event_type: 'regular',
  protein_types: [],
  side_types: [],
  vegetable_type: '',
  appetizer_type: 'none',
  chicken_count: 0,
  steak_count: 0,
  shrimp_count: 0,
  protein_upgrades: []
};

const categories = [
  { value: 'protein', label: 'Protein' },
  { value: 'side', label: 'Side Dish' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'vegetables', label: 'Vegetables' }
];

const proteinOptions = [
  'Chicken', 'Beef', 'Salmon', 'Shrimp', 'Scallops', 'Filet Mignon', 'Lobster', 'Tofu'
];

const sideOptions = [
  'Fried Rice', 'Noodles'
];

const appetizerOptions = [
  'Salad', 'Soup'
];

export default function MenuManagement() {
  const { dishes, packages, loading, createDish, updateDish, refetch } = useMenu();
  const [formData, setFormData] = useState<DishFormData>(initialFormData);
  const [editingDish, setEditingDish] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const filteredDishes = dishes.filter(dish => {
    // Only show active dishes
    if (!dish.is_active) return false;
    
    if (filter === 'all') return true;
    return dish.category === 'protein';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.base_price_per_guest <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate hibachi dinner requirements
    if (formData.event_type === 'hibachi_dinner') {
      const totalProteins = (formData.chicken_count || 0) + (formData.steak_count || 0) + (formData.shrimp_count || 0);
      if (totalProteins === 0) {
        toast.error('Please specify quantities for at least one protein type');
        return;
      }
    }

    try {
      if (editingDish) {
        await updateDish(editingDish, formData);
        toast.success('Menu item updated successfully');
      } else {
        await createDish(formData);
        toast.success('Menu item created successfully');
      }
      
      handleCloseDialog();
      refetch();
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleEdit = (dish: any) => {
    setFormData({
      name: dish.name,
      description: dish.description || '',
      base_price_per_guest: dish.base_price_per_guest,
      is_vegetarian: dish.is_vegetarian,
      is_vegan: dish.is_vegan,
      is_gluten_free: dish.is_gluten_free,
      is_active: dish.is_active ?? true,
      category: dish.category || 'protein',
      event_type: dish.event_type || 'regular',
      protein_types: dish.protein_types || [],
      side_types: dish.side_types || [],
      vegetable_type: dish.vegetable_type || '',
      appetizer_type: dish.appetizer_type || 'none',
      chicken_count: dish.chicken_count || 0,
      steak_count: dish.steak_count || 0,
      shrimp_count: dish.shrimp_count || 0,
      protein_upgrades: dish.protein_upgrades || []
    });
    setEditingDish(dish.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (dishId: string) => {
    try {
      await updateDish(dishId, { is_active: false });
      toast.success('Menu item deactivated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to deactivate menu item');
    }
  };

  const handleCloseDialog = () => {
    setFormData(initialFormData);
    setEditingDish(null);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: keyof DishFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu items...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Create and manage your menu items</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingDish ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Grilled Salmon"
                    required
                  />
                </div>
                
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
              </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select 
                    value={formData.event_type || 'regular'} 
                    onValueChange={(value) => handleInputChange('event_type', value === 'regular' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Menu Item</SelectItem>
                      <SelectItem value="hibachi_dinner">Hibachi Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              {formData.event_type === 'hibachi_dinner' && (
                <div className="space-y-6">
                  {/* Included Items Info */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">All hibachi dinners include:</h4>
                    <p className="text-sm text-muted-foreground">Fried Rice, Noodles, Hibachi Vegetables, and Side Salad</p>
                  </div>

                  {/* Protein Quantities */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Protein Quantities</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="chicken-count">Chicken</Label>
                        <Input
                          id="chicken-count"
                          type="number"
                          min="0"
                          value={formData.chicken_count || 0}
                          onChange={(e) => handleInputChange('chicken_count', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="steak-count">Steak</Label>
                        <Input
                          id="steak-count"
                          type="number"
                          min="0"
                          value={formData.steak_count || 0}
                          onChange={(e) => handleInputChange('steak_count', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shrimp-count">Shrimp</Label>
                        <Input
                          id="shrimp-count"
                          type="number"
                          min="0"
                          value={formData.shrimp_count || 0}
                          onChange={(e) => handleInputChange('shrimp_count', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Protein Upgrades */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Protein Upgrades/Substitutes</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = formData.protein_upgrades || [];
                          handleInputChange('protein_upgrades', [...current, { name: '', price: 0 }]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Upgrade
                      </Button>
                    </div>
                    
                    {formData.protein_upgrades && formData.protein_upgrades.length > 0 && (
                      <div className="space-y-3">
                        {formData.protein_upgrades.map((upgrade, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-1">
                              <Input
                                placeholder="e.g., Filet Mignon"
                                value={upgrade.name}
                                onChange={(e) => {
                                  const current = [...(formData.protein_upgrades || [])];
                                  current[index] = { ...current[index], name: e.target.value };
                                  handleInputChange('protein_upgrades', current);
                                }}
                              />
                            </div>
                            <div className="w-24">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">+$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="pl-8"
                                  value={upgrade.price}
                                  onChange={(e) => {
                                    const current = [...(formData.protein_upgrades || [])];
                                    current[index] = { ...current[index], price: parseFloat(e.target.value) || 0 };
                                    handleInputChange('protein_upgrades', current);
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = [...(formData.protein_upgrades || [])];
                                current.splice(index, 1);
                                handleInputChange('protein_upgrades', current);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!formData.protein_upgrades || formData.protein_upgrades.length === 0) && (
                      <div className="text-sm text-muted-foreground p-3 border-2 border-dashed rounded-lg text-center">
                        No protein upgrades added. Click "Add Upgrade" to add options like Filet Mignon +$5, Scallops +$3.
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the dish, ingredients, cooking method..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price per Guest *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price_per_guest}
                    onChange={(e) => handleInputChange('base_price_per_guest', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Dietary Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vegetarian"
                      checked={formData.is_vegetarian}
                      onCheckedChange={(checked) => handleInputChange('is_vegetarian', checked)}
                    />
                    <Label htmlFor="vegetarian" className="text-sm">Vegetarian</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vegan"
                      checked={formData.is_vegan}
                      onCheckedChange={(checked) => handleInputChange('is_vegan', checked)}
                    />
                    <Label htmlFor="vegan" className="text-sm">Vegan</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="glutenFree"
                      checked={formData.is_gluten_free}
                      onCheckedChange={(checked) => handleInputChange('is_gluten_free', checked)}
                    />
                    <Label htmlFor="glutenFree" className="text-sm">Gluten-Free</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDish ? 'Update Item' : 'Create Item'}
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
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dishes.length}</div>
          </CardContent>
        </Card>
        
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protein Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredDishes.length}</div>
            </CardContent>
          </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vegetarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dishes.filter(d => d.is_vegetarian).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="protein">Protein Items Only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Menu Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredDishes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDishes.length > 0 ? (
            <div className="space-y-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{dish.name}</h3>
                      <Badge variant="outline">${dish.base_price_per_guest}/guest</Badge>
                    </div>
                    
                    {dish.description && (
                      <p className="text-muted-foreground text-sm mb-2">{dish.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {dish.is_vegetarian && (
                        <Badge variant="secondary" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegetarian
                        </Badge>
                      )}
                      {dish.is_vegan && (
                        <Badge variant="secondary" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegan
                        </Badge>
                      )}
                      {dish.is_gluten_free && (
                        <Badge variant="secondary" className="text-xs">
                          Gluten-Free
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(dish)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(dish.id)}
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
                No menu items found. Create your first menu item to get started.
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}