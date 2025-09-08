import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Ingredient {
  id: string;
  name: string;
  cost_per_unit: number;
  unit_type: string;
  category: string;
}

interface IngredientCostTrackerProps {
  onCostCalculated?: (totalCost: number) => void;
}

export function IngredientCostTracker({ onCostCalculated }: IngredientCostTrackerProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Array<{
    ingredient: Ingredient;
    quantity: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, cost_per_unit, unit_type, category')
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

  const calculateTotalCost = () => {
    const total = selectedIngredients.reduce((sum, item) => {
      return sum + (item.ingredient.cost_per_unit * item.quantity);
    }, 0);
    
    if (onCostCalculated) {
      onCostCalculated(total);
    }
    
    return total;
  };

  const addIngredient = (ingredient: Ingredient) => {
    const existing = selectedIngredients.find(item => item.ingredient.id === ingredient.id);
    if (existing) {
      setSelectedIngredients(prev => 
        prev.map(item => 
          item.ingredient.id === ingredient.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedIngredients(prev => [...prev, { ingredient, quantity: 1 }]);
    }
  };

  const updateQuantity = (ingredientId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedIngredients(prev => prev.filter(item => item.ingredient.id !== ingredientId));
    } else {
      setSelectedIngredients(prev => 
        prev.map(item => 
          item.ingredient.id === ingredientId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading ingredients...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Ingredient Cost Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Ingredients */}
        <div>
          <h4 className="font-medium mb-3">Available Ingredients</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                onClick={() => addIngredient(ingredient)}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium">{ingredient.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    ${ingredient.cost_per_unit}/{ingredient.unit_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recipe Ingredients</h4>
            <div className="space-y-2">
              {selectedIngredients.map((item) => (
                <div key={item.ingredient.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.ingredient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.ingredient.id, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-sm border rounded"
                    />
                    <span className="text-xs text-muted-foreground">{item.ingredient.unit_type}</span>
                    <Badge variant="secondary" className="text-xs">
                      ${(item.ingredient.cost_per_unit * item.quantity).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Cost */}
        {selectedIngredients.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Total Cost Per Plate:</span>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-lg font-bold">{calculateTotalCost().toFixed(2)}</span>
            </div>
          </div>
        )}

        {selectedIngredients.length === 0 && (
          <div className="text-center text-muted-foreground p-4">
            Click on ingredients above to add them to your recipe
          </div>
        )}
      </CardContent>
    </Card>
  );
}