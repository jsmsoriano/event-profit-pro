import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from './use-toast';

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignment {
  id: string;
  event_id: string;
  staff_id: string;
  role_for_event: string;
  start_time?: string;
  end_time?: string;
  hourly_rate?: number;
  staff?: Staff;
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStaff = async () => {
    if (!user) {
      setStaff([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching staff",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (staffData: Omit<Staff, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create staff members",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([{ ...staffData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setStaff(prev => [...prev, data]);
      toast({
        title: "Staff member added",
        description: `${data.name} has been added to your team`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding staff member",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setStaff(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Staff member updated",
        description: "Changes saved successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating staff member",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStaff(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Staff member removed",
        description: "Staff member has been removed from your team",
      });
    } catch (error: any) {
      toast({
        title: "Error removing staff member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const assignStaffToEvent = async (eventId: string, staffId: string, roleForEvent: string, startTime?: string, endTime?: string, hourlyRate?: number) => {
    try {
      const { data, error } = await supabase
        .from('staff_assignments')
        .insert([{
          event_id: eventId,
          staff_id: staffId,
          role_for_event: roleForEvent,
          start_time: startTime,
          end_time: endTime,
          hourly_rate: hourlyRate
        }])
        .select(`
          *,
          staff (*)
        `)
        .single();

      if (error) throw error;

      toast({
        title: "Staff assigned",
        description: "Staff member has been assigned to the event",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error assigning staff",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getEventAssignments = async (eventId: string): Promise<StaffAssignment[]> => {
    try {
      const { data, error } = await supabase
        .from('staff_assignments')
        .select(`
          *,
          staff (*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching event assignments",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      fetchStaff();
    }
  }, [user]);

  return {
    staff,
    loading,
    createStaff,
    updateStaff,
    deleteStaff,
    assignStaffToEvent,
    getEventAssignments,
    refetch: fetchStaff
  };
}