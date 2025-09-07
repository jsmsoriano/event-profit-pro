import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, Minus, ArrowRight } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: string;
  mainCourse: string;
  sides: string[];
}

export default function MenuBuilder() {
  const { dishes, loading } = useMenu();
  const navigate = useNavigate();
  const [guestCount, setGuestCount] = useState<number>(10);
  const [menuItemCount, setMenuItemCount] = useState<number>(1);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', mainCourse: '', sides: [] }
  ]);

  const mainCourses = dishes.filter(dish => 
    dish.name.toLowerCase().includes('main') || 
    dish.name.toLowerCase().includes('entree') ||
    dish.name.toLowerCase().includes('chicken') ||
    dish.name.toLowerCase().includes('beef') ||
    dish.name.toLowerCase().includes('fish') ||
    dish.name.toLowerCase().includes('salmon')
  );
  
  const sideDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes('side') ||
    dish.name.toLowerCase().includes('vegetable') ||
    dish.name.toLowerCase().includes('rice') ||
    dish.name.toLowerCase().includes('potato') ||
    dish.name.toLowerCase().includes('salad')
  );

  // If no specific categories, show all dishes for both
  const availableMainCourses = mainCourses.length > 0 ? mainCourses : dishes;
  const availableSides = sideDishes.length > 0 ? sideDishes : dishes;

  const updateMenuItemCount = (count: number) => {
    setMenuItemCount(Math.max(1, count));
    
    const newItems = [...menuItems];
    if (count > menuItems.length) {
      // Add new items
      for (let i = menuItems.length; i < count; i++) {
        newItems.push({
          id: (i + 1).toString(),
          mainCourse: '',
          sides: []
        });
      }
    } else {
      // Remove excess items
      newItems.splice(count);
    }
    setMenuItems(newItems);
  };

  const updateMenuItem = (index: number, field: 'mainCourse', value: string) => {
    const newItems = [...menuItems];
    newItems[index][field] = value;
    setMenuItems(newItems);
  };

  const updateMenuItemSides = (index: number, sideId: string) => {
    const newItems = [...menuItems];
    const currentSides = newItems[index].sides;
    
    if (currentSides.includes(sideId)) {
      newItems[index].sides = currentSides.filter(id => id !== sideId);
    } else {
      newItems[index].sides = [...currentSides, sideId];
    }
    setMenuItems(newItems);
  };

  const canProceed = () => {
    return guestCount > 0 && menuItems.every(item => item.mainCourse);
  };

  const handleNext = () => {
    const selectedItems = {
      dishes: [],
      packages: [],
      menuBuilder: {
        guestCount,
        menuItems: menuItems.map(item => ({
          mainCourse: item.mainCourse,
          sides: item.sides
        }))
      }
    };
    
    localStorage.setItem('selectedMenuItems', JSON.stringify(selectedItems));
    navigate('/book');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu options...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Build Your Menu</h1>
        <p className="text-muted-foreground">
          Specify your guest count and create custom menu combinations
        </p>
      </div>

      {/* Guest Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Guest Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label htmlFor="guestCount" className="text-sm font-medium min-w-fit">
              Number of Guests:
            </Label>
            <Input
              id="guestCount"
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
              min="1"
              max="1000"
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Item Count */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Label className="text-sm font-medium">Number of Menu Items:</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateMenuItemCount(menuItemCount - 1)}
                disabled={menuItemCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{menuItemCount}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateMenuItemCount(menuItemCount + 1)}
                disabled={menuItemCount >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {menuItems.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Menu Item {index + 1}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Main Course Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Main Course *</Label>
                    <Select
                      value={item.mainCourse}
                      onValueChange={(value) => updateMenuItem(index, 'mainCourse', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select main course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMainCourses.map((dish) => (
                          <SelectItem key={dish.id} value={dish.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{dish.name}</span>
                              <Badge variant="outline" className="ml-2">
                                ${dish.base_price_per_guest}/guest
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sides Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Sides ({item.sides.length} selected)
                    </Label>
                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                      {availableSides.length > 0 ? (
                        <div className="grid gap-2">
                          {availableSides.map((dish) => (
                            <div
                              key={dish.id}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                item.sides.includes(dish.id)
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => updateMenuItemSides(index, dish.id)}
                            >
                              <span className="text-sm">{dish.name}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  ${dish.base_price_per_guest}
                                </Badge>
                                {item.sides.includes(dish.id) && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No side dishes available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < menuItems.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Guests:</span>
              <span className="font-medium">{guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Menu Items:</span>
              <span className="font-medium">{menuItemCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Items:</span>
              <span className="font-medium">
                {menuItems.filter(item => item.mainCourse).length}/{menuItemCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/menu')}>
          Back to Menu Management
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()}>
          Save Menu & Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}