import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface EventMenuItem {
  id: string;
  event_id: string;
  dish_id?: string;
  package_id?: string;
  quantity: number;
  per_guest_price?: number;
  total_price?: number;
  notes?: string;
  dish?: {
    id: string;
    name: string;
    base_price_per_guest: number;
  };
  package?: {
    id: string;
    name: string;
    price_per_guest: number;
  };
}

export function useEventMenuItems(eventId?: string) {
  const [menuItems, setMenuItems] = useState<EventMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async (targetEventId?: string) => {
    if (!targetEventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_menu_items')
        .select(`
          *,
          dish:dishes(*),
          package:packages(*)
        `)
        .eq('event_id', targetEventId)
        .order('created_at');

      if (error) throw error;
      setMenuItems((data || []) as unknown as EventMenuItem[]);
    } catch (error: any) {
      toast({
        title: "Error fetching menu items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<EventMenuItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('event_menu_items')
        .insert([item])
        .select(`
          *,
          dish:dishes(*),
          package:packages(*)
        `)
        .single();

      if (error) throw error;

      setMenuItems(prev => [...prev, data as unknown as EventMenuItem]);
      toast({
        title: "Menu item added",
        description: "Item has been added to the event menu",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding menu item",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<EventMenuItem>) => {
    try {
      const { data, error } = await supabase
        .from('event_menu_items')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          dish:dishes(*),
          package:packages(*)
        `)
        .single();

      if (error) throw error;

      setMenuItems(prev => prev.map(item => 
        item.id === id ? data as unknown as EventMenuItem : item
      ));
      toast({
        title: "Menu item updated",
        description: "Item has been updated successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating menu item",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const removeMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Menu item removed",
        description: "Item has been removed from the event menu",
      });
    } catch (error: any) {
      toast({
        title: "Error removing menu item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMenuItems(eventId);
  }, [eventId]);

  return {
    menuItems,
    loading,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    refetch: () => fetchMenuItems(eventId)
  };
}