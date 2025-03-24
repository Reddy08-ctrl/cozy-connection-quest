
import { User } from './userService';

export interface AiSuggestion {
  text: string;
  confidence: number;
}

// Simple sentiment analysis using regular expressions
const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const positiveWords = /happy|glad|excited|love|enjoy|wonderful|great|awesome|excellent|amazing/i;
  const negativeWords = /sad|upset|angry|hate|dislike|terrible|bad|awful|disappointed|annoyed/i;
  
  if (positiveWords.test(text)) return 'positive';
  if (negativeWords.test(text)) return 'negative';
  return 'neutral';
};

// Extract topics from text
const extractTopics = (text: string): string[] => {
  const topics = [];
  
  // Look for common interests/topics
  const topicPatterns = [
    { pattern: /travel|trip|vacation|visit|tourism/i, topic: 'travel' },
    { pattern: /food|eat|restaurant|cooking|recipe|cuisine/i, topic: 'food' },
    { pattern: /movie|film|series|tv show|watch|netflix|cinema/i, topic: 'entertainment' },
    { pattern: /music|song|concert|listen|spotify|playlist/i, topic: 'music' },
    { pattern: /sport|game|play|exercise|fitness|workout/i, topic: 'sports' },
    { pattern: /book|read|author|novel|story/i, topic: 'books' },
    { pattern: /art|paint|museum|gallery|creative/i, topic: 'art' },
    { pattern: /tech|technology|computer|software|app|device/i, topic: 'technology' },
    { pattern: /nature|outdoor|hiking|camping|forest|mountain/i, topic: 'nature' },
    { pattern: /pet|dog|cat|animal/i, topic: 'pets' }
  ];
  
  for (const { pattern, topic } of topicPatterns) {
    if (pattern.test(text)) {
      topics.push(topic);
    }
  }
  
  return topics;
};

// Generate chat suggestions based on message history and user profiles
export const generateChatSuggestions = (
  userProfile: User,
  otherUserProfile: User,
  messageHistory: { content: string; senderId: number }[]
): AiSuggestion[] => {
  try {
    const suggestions: AiSuggestion[] = [];
    
    // Basic suggestions always available
    const basicSuggestions = [
      { text: "How's your day going?", confidence: 0.7 },
      { text: "What are your plans for the weekend?", confidence: 0.7 },
      { text: "Have you seen any good movies lately?", confidence: 0.7 },
      { text: "What kind of music do you enjoy?", confidence: 0.7 },
      { text: "Do you have any upcoming trips planned?", confidence: 0.7 }
    ];
    
    // Add basic suggestions
    suggestions.push(...basicSuggestions);
    
    // Add location-based suggestion if location is available
    if (otherUserProfile.location) {
      suggestions.push({
        text: `I see you're from ${otherUserProfile.location}. What's it like living there?`,
        confidence: 0.85
      });
    }
    
    // Add suggestions based on user bio
    if (otherUserProfile.bio) {
      // Extract topics from bio
      const bioTopics = extractTopics(otherUserProfile.bio);
      
      for (const topic of bioTopics) {
        switch (topic) {
          case 'travel':
            suggestions.push({
              text: "What's your favorite place you've traveled to?",
              confidence: 0.9
            });
            break;
          case 'food':
            suggestions.push({
              text: "Do you enjoy cooking or do you prefer dining out?",
              confidence: 0.9
            });
            break;
          case 'entertainment':
            suggestions.push({
              text: "What's your favorite TV show or movie?",
              confidence: 0.9
            });
            break;
          case 'music':
            suggestions.push({
              text: "What kind of music do you listen to most often?",
              confidence: 0.9
            });
            break;
          case 'sports':
            suggestions.push({
              text: "Do you play any sports or follow any teams?",
              confidence: 0.9
            });
            break;
          case 'books':
            suggestions.push({
              text: "Have you read any good books lately?",
              confidence: 0.9
            });
            break;
          default:
            suggestions.push({
              text: `I noticed you mentioned ${topic} in your bio. Tell me more about that!`,
              confidence: 0.85
            });
        }
      }
    }
    
    // Analyze last few messages for context-aware suggestions
    if (messageHistory.length > 0) {
      const lastMessages = messageHistory.slice(-3);
      const combinedText = lastMessages.map(m => m.content).join(' ');
      const sentiment = analyzeSentiment(combinedText);
      const topics = extractTopics(combinedText);
      
      // Add sentiment-based suggestions
      if (sentiment === 'positive') {
        suggestions.push({
          text: "You seem to be in a good mood! What's made you happy lately?",
          confidence: 0.85
        });
      }
      
      // Add topic-based follow-up questions
      for (const topic of topics) {
        switch (topic) {
          case 'travel':
            suggestions.push({
              text: "What's on your travel bucket list?",
              confidence: 0.95
            });
            break;
          case 'food':
            suggestions.push({
              text: "What's your favorite cuisine?",
              confidence: 0.95
            });
            break;
          // ... add more for other topics
        }
      }
    }
    
    // Sort by confidence and return top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return [
      { text: 'How are you today?', confidence: 0.7 },
      { text: 'What are your plans for the weekend?', confidence: 0.7 },
      { text: 'Tell me more about yourself!', confidence: 0.7 }
    ];
  }
};
