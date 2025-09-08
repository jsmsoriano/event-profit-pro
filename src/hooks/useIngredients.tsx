import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit_type: string;
  cost_per_unit: number;
  current_quantity: number;
  minimum_stock: number;
  storage_location?: string;
  expiry_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;

      setIngredients(data || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIngredient = async (ingredientData: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        ...ingredientData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteIngredient = async (id: string) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const calculateIngredientCost = (ingredientUsage: Array<{ ingredient_id: string; quantity: number }>) => {
    return ingredientUsage.reduce((total, usage) => {
      const ingredient = ingredients.find(i => i.id === usage.ingredient_id);
      if (!ingredient) return total;
      return total + (ingredient.cost_per_unit * usage.quantity);
    }, 0);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return {
    ingredients,
    loading,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    calculateIngredientCost,
    refetch: fetchIngredients,
  };
}