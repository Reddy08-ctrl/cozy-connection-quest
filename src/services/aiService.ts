import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  lastUpdated: Date;
  messages: AIMessage[];
}

// Create a new AI chat session
export const createChatSession = async (userId: string, initialPrompt: string): Promise<ChatSession | null> => {
  try {
    // For now, we'll just create a session in memory
    // In a real app, this would be stored in Supabase
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      userId,
      title: 'New Chat Session',
      lastUpdated: new Date(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: initialPrompt,
          timestamp: new Date()
        }
      ]
    };
    
    // Generate assistant response
    const assistantMessage = await generateResponse(initialPrompt);
    
    if (assistantMessage) {
      session.messages.push({
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      });
    }
    
    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    return null;
  }
};

// Send a message to the AI assistant
export const sendMessage = async (sessionId: string, content: string): Promise<AIMessage | null> => {
  try {
    // Create user message
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // In a real app, we would store this in Supabase
    
    // Generate response
    const responseText = await generateResponse(content);
    
    if (responseText) {
      const assistantMessage: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      
      return assistantMessage;
    }
    
    return null;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Generic function to generate responses based on user input
export const generateResponse = async (prompt: string): Promise<string | null> => {
  try {
    // In a production app, this would call an API like OpenAI
    // For now, we'll just return some simulated responses
    
    // Check for keywords in the prompt
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('dating') || promptLower.includes('relationship')) {
      return "Building a healthy relationship takes time and effort. Focus on communication, trust, and understanding each other's needs and boundaries.";
    } else if (promptLower.includes('profile') || promptLower.includes('bio')) {
      return "A good dating profile highlights your personality, interests, and what makes you unique. Be honest and authentic, and include some conversation starters.";
    } else if (promptLower.includes('message') || promptLower.includes('chat')) {
      return "When starting a conversation, show genuine interest by asking open-ended questions. Reference something from their profile to show you've paid attention.";
    } else if (promptLower.includes('photo') || promptLower.includes('picture')) {
      return "Choose photos that show the real you, including a clear face shot, a full-body photo, and pictures of you doing activities you enjoy. Avoid using filters that dramatically change your appearance.";
    } else if (promptLower.includes('date') || promptLower.includes('meetup')) {
      return "For a first date, choose a public place where you can talk easily. Coffee shops, casual restaurants, or a walk in a park are good options. Keep it relatively short (1-2 hours) to leave room for anticipation if things go well.";
    }
    
    return "I'm here to help with all your dating and relationship questions. Feel free to ask about creating your profile, sending messages, planning dates, or developing meaningful connections.";
  } catch (error) {
    console.error('Error generating response:', error);
    toast.error('Failed to generate a response. Please try again.');
    return null;
  }
};

// Analyze a conversation to provide insights
export const analyzeConversation = async (messages: AIMessage[]): Promise<string | null> => {
  try {
    // For demo purposes, we'll just return some sample insights
    // In a real app, this would use NLP or a similar service
    
    if (messages.length <= 1) {
      return "The conversation is just getting started. Keep it going by asking open-ended questions.";
    }
    
    if (messages.length > 5 && messages.length < 10) {
      return "You're having a good conversation! Consider introducing a new topic or asking about their interests to keep the momentum going.";
    }
    
    if (messages.length >= 10) {
      return "This is a deep conversation! You might consider suggesting a video call or meeting in person if you feel comfortable.";
    }
    
    return "Keep the conversation going by being curious about them, sharing about yourself, and looking for common interests.";
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    return null;
  }
};

// Fix the comparison error (number === string)
export const generateCompatibilityScore = (answers1: Record<string, string>, answers2: Record<string, string>): number => {
  if (!answers1 || !answers2) {
    return 0;
  }
  
  let matchingAnswers = 0;
  let totalQuestions = 0;
  
  // Compare answers
  for (const questionId in answers1) {
    if (questionId in answers2) {
      totalQuestions++;
      // Convert both to string before comparing
      if (String(answers1[questionId]) === String(answers2[questionId])) {
        matchingAnswers++;
      }
    }
  }
  
  if (totalQuestions === 0) {
    return 0;
  }
  
  // Calculate percentage match
  return Math.round((matchingAnswers / totalQuestions) * 100);
};
