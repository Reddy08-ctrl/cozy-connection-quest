
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from './userService';
import { generateChatSuggestions } from './aiService';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  createdAt: Date;
  senderName?: string;
  senderAvatar?: string;
}

// Get chat history between two users
export const getChatHistory = async (userId: number, otherUserId: number): Promise<Message[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        read,
        created_at,
        profiles!sender_id (name, avatar)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
    
    // Mark messages as read
    if (messages) {
      const unreadMessages = messages.filter(
        m => m.sender_id === otherUserId && m.receiver_id === userId && !m.read
      );
      
      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadMessages.map(m => m.id));
        
        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      }
    }
    
    // Format messages
    return (messages || []).map(message => ({
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      read: Boolean(message.read),
      createdAt: new Date(message.created_at),
      senderName: message.profiles?.name,
      senderAvatar: message.profiles?.avatar
    }));
    
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Send a message
export const sendMessage = async (
  senderId: number,
  receiverId: number,
  content: string
): Promise<Message | null> => {
  try {
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        read,
        created_at,
        profiles!sender_id (name, avatar)
      `)
      .single();
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      read: Boolean(data.read),
      createdAt: new Date(data.created_at),
      senderName: data.profiles?.name,
      senderAvatar: data.profiles?.avatar
    };
    
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get unread message count
export const getUnreadCount = async (userId: number): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Get AI-powered chat suggestions
export const getAiSuggestions = async (userId: number, otherUserId: number): Promise<string[]> => {
  try {
    // Get profile information for both users
    const userProfile = await getUserProfile(userId);
    const otherUserProfile = await getUserProfile(otherUserId);
    
    // Get chat history (last 10 messages)
    const { data: messages, error } = await supabase
      .from('messages')
      .select('content, sender_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error getting chat history for suggestions:', error);
      return [
        'How are you today?',
        'What are your plans for the weekend?',
        'Tell me more about yourself!'
      ];
    }
    
    const chatHistory = (messages || []).map(m => ({
      content: m.content,
      senderId: m.sender_id
    }));
    
    // Use AI service to generate suggestions
    const suggestions = await generateChatSuggestions(userProfile, otherUserProfile, chatHistory);
    
    // Return just the text of the suggestions
    return suggestions.map(s => s.text);
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return [
      'How are you today?',
      'What are your plans for the weekend?',
      'Tell me more about yourself!'
    ];
  }
};
