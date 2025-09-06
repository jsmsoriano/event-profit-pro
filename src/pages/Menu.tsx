import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Leaf, Users, ShoppingCart } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useNavigate } from 'react-router-dom';

export default function Menu() {
  const { dishes, packages, loading, getFilteredMenu } = useMenu();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false
  });
  const [selectedItems, setSelectedItems] = useState<{
    dishes: string[];
    packages: string[];
  }>({
    dishes: [],
    packages: []
  });

  // Memoize filtered results to prevent unnecessary recalculations
  const { dishes: filteredDishes, packages: filteredPackages } = useMemo(
    () => getFilteredMenu(filters), 
    [dishes, packages, filters, getFilteredMenu]
  );

  const handleFilterChange = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handleItemSelection = (itemId: string, type: 'dish' | 'package') => {
    setSelectedItems(prev => ({
      ...prev,
      [type === 'dish' ? 'dishes' : 'packages']: 
        prev[type === 'dish' ? 'dishes' : 'packages'].includes(itemId)
          ? prev[type === 'dish' ? 'dishes' : 'packages'].filter(id => id !== itemId)
          : [...prev[type === 'dish' ? 'dishes' : 'packages'], itemId]
    }));
  };

  const getQuote = () => {
    // Store selections in localStorage for the booking flow
    localStorage.setItem('selectedMenuItems', JSON.stringify(selectedItems));
    navigate('/book');
  };

  const buildCustomMenu = () => {
    navigate('/admin/events/new');
  };

  const totalSelected = selectedItems.dishes.length + selectedItems.packages.length;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Our Menu</h1>
          <p className="text-xl text-muted-foreground">Loading our delicious offerings...</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Our Menu</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Discover our carefully curated selection of dishes and packages, 
          crafted with the finest ingredients and attention to detail.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={buildCustomMenu}>
            Build Custom Menu
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="h-5 w-5 mr-2" />
            Dietary Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vegetarian"
                checked={filters.vegetarian}
                onCheckedChange={() => handleFilterChange('vegetarian')}
              />
              <label htmlFor="vegetarian" className="text-sm font-medium">
                Vegetarian
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vegan"
                checked={filters.vegan}
                onCheckedChange={() => handleFilterChange('vegan')}
              />
              <label htmlFor="vegan" className="text-sm font-medium">
                Vegan
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="glutenFree"
                checked={filters.glutenFree}
                onCheckedChange={() => handleFilterChange('glutenFree')}
              />
              <label htmlFor="glutenFree" className="text-sm font-medium">
                Gluten-Free
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Section */}
      {filteredPackages.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Packages</h2>
            <Badge variant="secondary">{filteredPackages.length} available</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedItems.packages.includes(pkg.id) 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleItemSelection(pkg.id, 'package')}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <Badge variant="outline">${pkg.price_per_guest}/guest</Badge>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    Minimum {pkg.min_guests} guests
                  </div>
                </CardHeader>
                
                {pkg.package_items && pkg.package_items.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Includes:</p>
                      {pkg.package_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2" />
                          {item.dish?.name || 'Unknown Dish'}
                          {item.qty_per_guest > 1 && (
                            <span className="ml-1">({item.qty_per_guest}x per guest)</span>
                          )}
                        </div>
                      ))}
                      {pkg.package_items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{pkg.package_items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {filteredPackages.length > 0 && filteredDishes.length > 0 && (
        <Separator className="my-8" />
      )}

      {/* Individual Dishes Section */}
      {filteredDishes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Individual Dishes</h2>
            <Badge variant="secondary">{filteredDishes.length} available</Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <Card 
                key={dish.id}
                className={`cursor-pointer transition-all ${
                  selectedItems.dishes.includes(dish.id) 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleItemSelection(dish.id, 'dish')}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{dish.name}</CardTitle>
                    <Badge variant="outline">${dish.base_price_per_guest}/guest</Badge>
                  </div>
                  {dish.description && (
                    <p className="text-sm text-muted-foreground">{dish.description}</p>
                  )}
                </CardHeader>
                
                <CardContent>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredDishes.length === 0 && filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No items match your current filters. Try adjusting your dietary preferences.
          </p>
        </div>
      )}

      {/* Sticky Quote Button */}
      {totalSelected > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={getQuote}
            className="shadow-lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Get Quote ({totalSelected} items)
          </Button>
        </div>
      )}
    </div>
  );
}