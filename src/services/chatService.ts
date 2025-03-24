
import { query } from './database';
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
    const messages = await query(
      `SELECT m.*, 
              u1.name as sender_name, 
              u1.avatar as sender_avatar
       FROM messages m
       JOIN users u1 ON m.sender_id = u1.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );
    
    if (!Array.isArray(messages)) {
      return [];
    }
    
    // Mark messages as read
    await query(
      `UPDATE messages 
       SET read = true 
       WHERE sender_id = ? AND receiver_id = ? AND read = false`,
      [otherUserId, userId]
    );
    
    // Format messages
    return messages.map(message => ({
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      read: Boolean(message.read),
      createdAt: message.created_at,
      senderName: message.sender_name,
      senderAvatar: message.sender_avatar
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
    const result = await query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content]
    );
    
    const messageId = result.insertId;
    
    // Get the inserted message
    const messages = await query(
      `SELECT m.*, 
              u.name as sender_name, 
              u.avatar as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [messageId]
    );
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return null;
    }
    
    const message = messages[0];
    
    return {
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      read: Boolean(message.read),
      createdAt: message.created_at,
      senderName: message.sender_name,
      senderAvatar: message.sender_avatar
    };
    
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Get unread message count
export const getUnreadCount = async (userId: number): Promise<number> => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = false',
      [userId]
    );
    
    return Array.isArray(result) ? result[0].count : 0;
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
    const messages = await query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId, otherUserId, otherUserId, userId]
    );
    
    const chatHistory = messages.map(m => ({
      content: m.content,
      senderId: m.sender_id
    }));
    
    // Use AI service to generate suggestions
    const suggestions = generateChatSuggestions(userProfile, otherUserProfile, chatHistory);
    
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
