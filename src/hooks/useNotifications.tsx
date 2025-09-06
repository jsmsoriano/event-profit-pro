import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  related_id?: string;
  is_read: boolean;
  is_sent: boolean;
  scheduled_for: string;
  sent_at?: string;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error: any) {
      toast({
        title: "Error fetching notifications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: {
    title: string;
    message: string;
    notification_type?: string;
    related_id?: string;
    scheduled_for?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          user_id: 'default-user', // Placeholder since auth is disabled
          notification_type: notificationData.notification_type || 'general',
          scheduled_for: notificationData.scheduled_for || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating notification",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error marking notification as read",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "All notifications marked as read",
        description: "Your notification inbox is now clear",
      });
    } catch (error: any) {
      toast({
        title: "Error marking notifications as read",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: "Notification deleted",
        description: "Notification has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting notification",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Create common notification types
  const createEventReminder = async (eventId: string, eventName: string, reminderTime: string) => {
    return createNotification({
      title: 'Event Reminder',
      message: `Don't forget about ${eventName} coming up!`,
      notification_type: 'event_reminder',
      related_id: eventId,
      scheduled_for: reminderTime
    });
  };

  const createPaymentDue = async (clientId: string, clientName: string, amount: number, dueDate: string) => {
    return createNotification({
      title: 'Payment Due',
      message: `Payment of $${amount.toFixed(2)} from ${clientName} is due soon`,
      notification_type: 'payment_due',
      related_id: clientId,
      scheduled_for: dueDate
    });
  };

  const createInventoryAlert = async (itemId: string, itemName: string, currentStock: number) => {
    return createNotification({
      title: 'Low Stock Alert',
      message: `${itemName} is running low (${currentStock} remaining)`,
      notification_type: 'inventory_low',
      related_id: itemId
    });
  };

  const createTaskDue = async (taskId: string, taskName: string, dueTime: string) => {
    return createNotification({
      title: 'Task Due',
      message: `Task "${taskName}" is due soon`,
      notification_type: 'task_due',
      related_id: taskId,
      scheduled_for: dueTime
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createEventReminder,
    createPaymentDue,
    createInventoryAlert,
    createTaskDue,
    refetch: fetchNotifications
  };
}