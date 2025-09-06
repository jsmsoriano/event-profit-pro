import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  unit_type: string;
  current_quantity: number;
  minimum_stock: number;
  cost_per_unit: number;
  supplier_id?: string;
  storage_location?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  rating?: number;
  is_active: boolean;
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          supplier:suppliers (*)
        `)
        .eq('user_id', 'default-user')
        .order('name');

      if (error) throw error;
      setInventory(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching inventory",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', 'default-user')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching suppliers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{ ...itemData, user_id: 'default-user' }])
        .select()
        .single();

      if (error) throw error;

      setInventory(prev => [...prev, data]);
      toast({
        title: "Inventory item added",
        description: `${data.name} has been added to your inventory`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding inventory item",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInventory(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Inventory item updated",
        description: "Changes saved successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating inventory item",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: 'default-user' }])
        .select()
        .single();

      if (error) throw error;

      setSuppliers(prev => [...prev, data]);
      toast({
        title: "Supplier added",
        description: `${data.name} has been added to your suppliers`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding supplier",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.current_quantity <= item.minimum_stock);
  };

  const getExpiringItems = (daysAhead: number = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return inventory.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= futureDate;
    });
  };

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
  }, []);

  return {
    inventory,
    suppliers,
    loading,
    createInventoryItem,
    updateInventoryItem,
    createSupplier,
    getLowStockItems,
    getExpiringItems,
    refetch: () => {
      fetchInventory();
      fetchSuppliers();
    }
  };
}