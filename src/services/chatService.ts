
import { supabase } from '@/integrations/supabase/client';
import { User, getUserProfile } from './userService';

export interface Message {
  id: number | string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  senderProfile?: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiverProfile?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Get messages between two users
export const getMessages = async (userId: string, otherUserId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    // Mark messages as read
    if (data && data.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .eq('read', false);
      
      if (updateError) {
        console.error('Error marking messages as read:', updateError);
      }
    }
    
    // Format messages
    return (data || []).map(message => ({
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      read: message.read,
      createdAt: new Date(message.created_at),
      senderProfile: message.sender ? {
        id: message.sender.id,
        name: message.sender.name,
        avatar: message.sender.avatar
      } : undefined,
      receiverProfile: message.receiver ? {
        id: message.receiver.id,
        name: message.receiver.name,
        avatar: message.receiver.avatar
      } : undefined
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (senderId: string, receiverId: string, content: string): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar)
      `)
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    if (!data) {
      console.error('No data returned after sending message');
      return null;
    }
    
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      read: data.read,
      createdAt: new Date(data.created_at),
      senderProfile: data.sender ? {
        id: data.sender.id,
        name: data.sender.name,
        avatar: data.sender.avatar
      } : undefined,
      receiverProfile: data.receiver ? {
        id: data.receiver.id,
        name: data.receiver.name,
        avatar: data.receiver.avatar
      } : undefined
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('count')
      .eq('receiver_id', userId)
      .eq('read', false)
      .single();
    
    if (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
    
    return data?.count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};

// Get recent conversations
export const getRecentConversations = async (userId: string): Promise<{user: User, lastMessage: Message, unreadCount: number}[]> => {
  try {
    // This query gets the most recent message from each conversation
    const { data, error } = await supabase.rpc('get_recent_conversations', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error fetching recent conversations:', error);
      return [];
    }
    
    // Process and format the conversations
    const conversations = [];
    
    for (const conv of (data || [])) {
      // Get the other user's profile
      const otherUserId = conv.sender_id === userId ? conv.receiver_id : conv.sender_id;
      const otherUser = await getUserProfile(otherUserId);
      
      if (otherUser) {
        // Get unread count
        const { data: countData, error: countError } = await supabase
          .from('messages')
          .select('count')
          .eq('receiver_id', userId)
          .eq('sender_id', otherUserId)
          .eq('read', false)
          .single();
        
        if (countError) {
          console.error('Error getting unread count:', countError);
        }
        
        conversations.push({
          user: otherUser,
          lastMessage: {
            id: conv.id,
            senderId: conv.sender_id,
            receiverId: conv.receiver_id,
            content: conv.content,
            read: conv.read,
            createdAt: new Date(conv.created_at)
          },
          unreadCount: countData?.count || 0
        });
      }
    }
    
    return conversations;
  } catch (error) {
    console.error('Error getting recent conversations:', error);
    return [];
  }
};
