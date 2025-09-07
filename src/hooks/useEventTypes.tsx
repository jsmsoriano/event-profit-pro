import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EventType {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  description?: string;
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEventTypes() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEventTypes = async () => {
    if (!user) {
      setEventTypes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error: any) {
      console.error('Error fetching event types:', error);
      toast.error('Failed to load event types');
    } finally {
      setLoading(false);
    }
  };

  const createEventType = async (eventTypeData: Omit<EventType, 'id' | 'user_id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to create event types');
      return null;
    }

    try {
      // Get user's organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase
        .from('event_types')
        .insert([{ 
          ...eventTypeData, 
          user_id: user.id,
          organization_id: profile?.organization_id
        }])
        .select()
        .single();

      if (error) throw error;

      setEventTypes(prev => [...prev, data]);
      toast.success('Event type created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating event type:', error);
      toast.error('Failed to create event type');
      return null;
    }
  };

  const updateEventType = async (id: string, updates: Partial<EventType>) => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEventTypes(prev => prev.map(type => type.id === id ? data : type));
      toast.success('Event type updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating event type:', error);
      toast.error('Failed to update event type');
      return null;
    }
  };

  const deleteEventType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setEventTypes(prev => prev.filter(type => type.id !== id));
      toast.success('Event type deactivated successfully');
    } catch (error: any) {
      console.error('Error deactivating event type:', error);
      toast.error('Failed to deactivate event type');
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, [user]);

  return {
    eventTypes,
    loading,
    createEventType,
    updateEventType,
    deleteEventType,
    refetch: fetchEventTypes
  };
}