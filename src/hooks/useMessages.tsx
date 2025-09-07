import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
  recipient?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface Conversation {
  user_id: string;
  user_name: string;
  last_message?: Message;
  unread_count: number;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      // Get messages first
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get all unique user IDs
      const userIds = new Set<string>();
      messagesData?.forEach(msg => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      // Get profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create profiles map for quick lookup
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Enhance messages with profile data
      const data = messagesData?.map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id),
        recipient: profilesMap.get(msg.recipient_id)
      })) as Message[];

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      data?.forEach((message: Message) => {
        const partnerId = message.sender_id === currentUser.id ? message.recipient_id : message.sender_id;
        const partner = message.sender_id === currentUser.id ? message.recipient : message.sender;
        const partnerName = partner 
          ? `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || 'Unknown User'
          : 'Unknown User';

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user_id: partnerId,
            user_name: partnerName,
            last_message: message,
            unread_count: 0
          });
        }

        // Count unread messages
        if (!message.is_read && message.recipient_id === currentUser.id) {
          const conv = conversationMap.get(partnerId);
          if (conv) {
            conv.unread_count += 1;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (partnerId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      // Get messages first
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles for sender and recipient
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', [currentUser.id, partnerId]);

      if (profilesError) throw profilesError;

      // Create profiles map
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Enhance messages with profile data
      const data = messagesData?.map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id),
        recipient: profilesMap.get(msg.recipient_id)
      })) as Message[];

      if (error) throw error;

      setMessages(data || []);

      // Mark messages as read
      await markMessagesAsRead(partnerId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!currentUser || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: recipientId,
          content: content.trim()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message sent successfully'
      });

      // Refresh conversations
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (senderId: string) => {
    if (!currentUser) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', currentUser.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Get all users for new conversations
  const getUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .neq('id', currentUser?.id);

      if (error) throw error;

      return data?.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
      })) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id})`
        },
        (payload) => {
          console.log('Message update:', payload);
          // Refresh conversations and current messages
          fetchConversations();
          if (messages.length > 0) {
            const partnerId = messages[0]?.sender_id === currentUser.id 
              ? messages[0]?.recipient_id 
              : messages[0]?.sender_id;
            if (partnerId) {
              fetchMessages(partnerId);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, messages.length]);

  // Load conversations on component mount
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  return {
    messages,
    conversations,
    loading,
    currentUser,
    fetchMessages,
    sendMessage,
    getUsers,
    markMessagesAsRead
  };
};