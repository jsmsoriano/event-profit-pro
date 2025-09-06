import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface EventTask {
  id: string;
  event_id: string;
  task_name: string;
  description?: string;
  assigned_staff?: string;
  due_time?: string;
  completed_at?: string;
  priority: string;
  task_category: string;
  estimated_duration?: number;
  created_at: string;
  updated_at: string;
  staff?: { name: string };
}

export interface EventMilestone {
  id: string;
  event_id: string;
  milestone_name: string;
  scheduled_time: string;
  completed_at?: string;
  assigned_staff?: string;
  notes?: string;
  milestone_type: string;
  created_at: string;
  staff?: { name: string };
}

export function useEventTasks(eventId?: string) {
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [milestones, setMilestones] = useState<EventMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (targetEventId?: string) => {
    if (!targetEventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .select(`
          *,
          staff:assigned_staff (name)
        `)
        .eq('event_id', targetEventId)
        .order('due_time', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchMilestones = async (targetEventId?: string) => {
    if (!targetEventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_milestones')
        .select(`
          *,
          staff:assigned_staff (name)
        `)
        .eq('event_id', targetEventId)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching milestones",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<EventTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      toast({
        title: "Task created",
        description: `${data.task_name} has been added to the event`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<EventTask>) => {
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast({
        title: "Task updated",
        description: "Changes saved successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const completeTask = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('event_tasks')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast({
        title: "Task completed",
        description: "Great job! Task marked as complete",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error completing task",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createMilestone = async (milestoneData: Omit<EventMilestone, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('event_milestones')
        .insert([milestoneData])
        .select()
        .single();

      if (error) throw error;

      setMilestones(prev => [...prev, data]);
      toast({
        title: "Milestone created",
        description: `${data.milestone_name} has been added to the timeline`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating milestone",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const completeMilestone = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('event_milestones')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMilestones(prev => prev.map(milestone => milestone.id === id ? data : milestone));
      toast({
        title: "Milestone completed",
        description: "Milestone marked as complete",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error completing milestone",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      !task.completed_at && 
      task.due_time && 
      new Date(task.due_time) < now
    );
  };

  const getUpcomingMilestones = (hoursAhead: number = 24) => {
    const now = new Date();
    const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    
    return milestones.filter(milestone => 
      !milestone.completed_at && 
      new Date(milestone.scheduled_time) >= now &&
      new Date(milestone.scheduled_time) <= future
    );
  };

  useEffect(() => {
    if (eventId) {
      fetchTasks(eventId);
      fetchMilestones(eventId);
    }
  }, [eventId]);

  return {
    tasks,
    milestones,
    loading,
    createTask,
    updateTask,
    completeTask,
    createMilestone,
    completeMilestone,
    getOverdueTasks,
    getUpcomingMilestones,
    refetch: () => {
      if (eventId) {
        fetchTasks(eventId);
        fetchMilestones(eventId);
      }
    }
  };
}