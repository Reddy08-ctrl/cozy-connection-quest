
import { supabase } from '@/integrations/supabase/client';
import { User, getUserProfile } from '@/services/userService';

export interface Message {
  id: number;
  senderId: string; // Changed from number to string
  receiverId: string; // Changed from number to string
  content: string;
  read: boolean;
  createdAt: Date;
  senderProfile?: User;
  receiverProfile?: User;
}

// Get messages between two users
export const getMessages = async (user1Id: string, user2Id: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(id, name, avatar),
        profiles!messages_receiver_id_fkey(id, name, avatar)
      `)
      .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error getting messages:', error);
      return [];
    }
    
    // Mark all received messages as read
    const unreadMessages = (data || []).filter(
      msg => msg.receiver_id === user1Id && !msg.read
    );
    
    if (unreadMessages.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessages.map(msg => msg.id));
      
      if (updateError) {
        console.error('Error marking messages as read:', updateError);
      }
    }
    
    // Transform the data
    return (data || []).map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      read: msg.read,
      createdAt: new Date(msg.created_at),
      senderProfile: msg.profiles ? {
        id: msg.profiles.id,
        name: msg.profiles.name,
        avatar: msg.profiles.avatar
      } : undefined,
      receiverProfile: msg.profiles2 ? {
        id: msg.profiles2.id,
        name: msg.profiles2.name,
        avatar: msg.profiles2.avatar
      } : undefined
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    // Get sender profile
    const senderProfile = await getUserProfile(senderId);
    
    // Get receiver profile
    const receiverProfile = await getUserProfile(receiverId);
    
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      read: data.read,
      createdAt: new Date(data.created_at),
      senderProfile,
      receiverProfile
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get conversations for a user
export const getConversations = async (userId: string): Promise<Array<Message & { otherUser: User }>> => {
  try {
    // Get the most recent message from each conversation
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey(id, name, avatar),
        profiles!messages_receiver_id_fkey(id, name, avatar)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
    
    // Get unique conversations
    const conversationMap = new Map();
    
    for (const msg of data || []) {
      // Determine the other user in the conversation
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      // Only add the first message (most recent) for each conversation
      if (!conversationMap.has(otherUserId)) {
        // Determine the other user's profile
        const otherUserProfile = msg.sender_id === userId ? msg.profiles2 : msg.profiles;
        
        if (otherUserProfile) {
          conversationMap.set(otherUserId, {
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: msg.content,
            read: msg.read,
            createdAt: new Date(msg.created_at),
            otherUser: {
              id: otherUserProfile.id,
              name: otherUserProfile.name,
              avatar: otherUserProfile.avatar,
              email: '' // We don't have email from the join
            }
          });
        }
      }
    }
    
    return Array.from(conversationMap.values());
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// Get unread message count
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('receiver_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};
