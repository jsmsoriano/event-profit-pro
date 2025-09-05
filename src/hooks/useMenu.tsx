import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Dish {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  base_price_per_guest: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  price_per_guest: number;
  min_guests: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  package_items?: PackageItem[];
}

export interface PackageItem {
  id: string;
  package_id: string;
  dish_id: string;
  qty_per_guest: number;
  dish?: Dish;
}

export function useMenu() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDishes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDishes(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching dishes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPackages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          package_items (
            *,
            dish:dishes (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching packages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDish = async (dishData: Omit<Dish, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dishes')
        .insert([{ ...dishData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setDishes(prev => [...prev, data]);
      toast({
        title: "Dish created",
        description: `${data.name} has been added to your menu`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating dish",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateDish = async (id: string, updates: Partial<Dish>) => {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDishes(prev => prev.map(dish => dish.id === id ? data : dish));
      toast({
        title: "Dish updated",
        description: "Changes saved successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating dish",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createPackage = async (packageData: Omit<Package, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{ ...packageData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setPackages(prev => [...prev, data]);
      toast({
        title: "Package created",
        description: `${data.name} has been added to your menu`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating package",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePackage = async (id: string, updates: Partial<Package>) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPackages(prev => prev.map(pkg => pkg.id === id ? data : pkg));
      toast({
        title: "Package updated",
        description: "Changes saved successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating package",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const addDishToPackage = async (packageId: string, dishId: string, qtyPerGuest: number = 1) => {
    try {
      const { data, error } = await supabase
        .from('package_items')
        .insert([{
          package_id: packageId,
          dish_id: dishId,
          qty_per_guest: qtyPerGuest
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh packages to get updated data
      await fetchPackages();
      
      toast({
        title: "Dish added to package",
        description: "Package updated successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding dish to package",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const removeDishFromPackage = async (packageItemId: string) => {
    try {
      const { error } = await supabase
        .from('package_items')
        .delete()
        .eq('id', packageItemId);

      if (error) throw error;

      // Refresh packages to get updated data
      await fetchPackages();
      
      toast({
        title: "Dish removed from package",
        description: "Package updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error removing dish from package",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFilteredMenu = (filters: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
  }) => {
    let filteredDishes = dishes;
    let filteredPackages = packages;

    if (filters.vegetarian) {
      filteredDishes = filteredDishes.filter(dish => dish.is_vegetarian);
    }
    if (filters.vegan) {
      filteredDishes = filteredDishes.filter(dish => dish.is_vegan);
    }
    if (filters.glutenFree) {
      filteredDishes = filteredDishes.filter(dish => dish.is_gluten_free);
    }

    // For packages, check if all dishes in the package meet the filter criteria
    if (filters.vegetarian || filters.vegan || filters.glutenFree) {
      filteredPackages = filteredPackages.filter(pkg => {
        if (!pkg.package_items) return true;
        
        return pkg.package_items.every(item => {
          if (!item.dish) return true;
          
          let meets = true;
          if (filters.vegetarian) meets = meets && item.dish.is_vegetarian;
          if (filters.vegan) meets = meets && item.dish.is_vegan;
          if (filters.glutenFree) meets = meets && item.dish.is_gluten_free;
          
          return meets;
        });
      });
    }

    return { dishes: filteredDishes, packages: filteredPackages };
  };

  useEffect(() => {
    if (user) {
      fetchDishes();
      fetchPackages();
    }
  }, [user]);

  return {
    dishes,
    packages,
    loading,
    createDish,
    updateDish,
    createPackage,
    updatePackage,
    addDishToPackage,
    removeDishFromPackage,
    getFilteredMenu,
    refetch: () => {
      fetchDishes();
      fetchPackages();
    }
  };
}