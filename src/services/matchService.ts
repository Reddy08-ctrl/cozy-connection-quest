
import { query } from './database';
import { getUserAnswers } from './questionnaireService';
import { getUserProfile } from './userService';

export interface Match {
  id: number;
  userId: number;
  matchedUserId: number;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  matchedUser: {
    name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    age?: number;
  };
}

// Calculate the age from date of birth
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Simple function to calculate the similarity between two strings
const calculateStringSimilarity = (str1: string, str2: string): number => {
  // Convert to lowercase
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Count matching words
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  // Create a set of all unique words
  const uniqueWords = new Set([...words1, ...words2]);
  
  // Count words that appear in both strings
  let matchingWords = 0;
  uniqueWords.forEach(word => {
    if (words1.includes(word) && words2.includes(word)) {
      matchingWords++;
    }
  });
  
  // Jaccard similarity coefficient
  return uniqueWords.size > 0 ? matchingWords / uniqueWords.size : 0;
};

// Calculate similarity between two sets of answers
const calculateSimilarity = (userAnswers: any[], otherUserAnswers: any[]): number => {
  // Create a map of question_id to answer for quick lookup
  const userAnswersMap = new Map();
  userAnswers.forEach(answer => {
    userAnswersMap.set(answer.question_id, answer.answer);
  });
  
  const otherUserAnswersMap = new Map();
  otherUserAnswers.forEach(answer => {
    otherUserAnswersMap.set(answer.question_id, answer.answer);
  });
  
  let totalSimilarity = 0;
  let questionCount = 0;
  
  // For each question that both users have answered
  for (const [questionId, userAnswer] of userAnswersMap.entries()) {
    if (otherUserAnswersMap.has(questionId)) {
      const otherUserAnswer = otherUserAnswersMap.get(questionId);
      
      // Calculate string similarity
      const similarity = calculateStringSimilarity(userAnswer, otherUserAnswer);
      
      totalSimilarity += similarity;
      questionCount++;
    }
  }
  
  // Return average similarity across all questions
  return questionCount > 0 ? totalSimilarity / questionCount : 0;
};

// Find matches for a user
export const findMatches = async (userId: number): Promise<Match[]> => {
  try {
    // Get user's profile and answers
    const userProfile = await getUserProfile(userId);
    const userAnswers = await getUserAnswers(userId);
    
    if (!userAnswers || userAnswers.length === 0) {
      throw new Error('User has not completed the questionnaire');
    }
    
    // Get other users who have completed the questionnaire
    const otherUsers = await query(
      `SELECT DISTINCT u.id, u.name, u.avatar, u.bio, u.location, u.date_of_birth, u.gender
       FROM users u
       JOIN user_answers ua ON u.id = ua.user_id
       WHERE u.id != ?
       GROUP BY u.id
       HAVING COUNT(ua.id) > 0`,
      [userId]
    );
    
    if (!Array.isArray(otherUsers) || otherUsers.length === 0) {
      return [];
    }
    
    const matches: Match[] = [];
    
    // Calculate match scores with other users
    for (const otherUser of otherUsers) {
      const otherUserAnswers = await getUserAnswers(otherUser.id);
      
      // Calculate similarity score
      const similarityScore = calculateSimilarity(userAnswers, otherUserAnswers);
      
      // Check if a match already exists
      const existingMatches = await query(
        `SELECT * FROM matches 
         WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)`,
        [userId, otherUser.id, otherUser.id, userId]
      );
      
      let matchId = 0;
      let matchStatus = 'pending';
      
      if (Array.isArray(existingMatches) && existingMatches.length > 0) {
        const existingMatch = existingMatches[0];
        matchId = existingMatch.id;
        matchStatus = existingMatch.status;
        
        // Update the match score if it has changed
        if (Math.abs(existingMatch.match_score - similarityScore) > 0.1) {
          await query(
            'UPDATE matches SET match_score = ? WHERE id = ?',
            [similarityScore, matchId]
          );
        }
      } else {
        // Create a new match
        const result = await query(
          'INSERT INTO matches (user_id_1, user_id_2, match_score) VALUES (?, ?, ?)',
          [userId, otherUser.id, similarityScore]
        );
        matchId = result.insertId;
      }
      
      // Add to matches list if the score is above a threshold
      if (similarityScore > 0.4) { // Arbitrary threshold
        matches.push({
          id: matchId,
          userId,
          matchedUserId: otherUser.id,
          matchScore: similarityScore,
          status: matchStatus as 'pending' | 'accepted' | 'rejected',
          matchedUser: {
            name: otherUser.name,
            avatar: otherUser.avatar,
            bio: otherUser.bio,
            location: otherUser.location,
            age: otherUser.date_of_birth ? calculateAge(otherUser.date_of_birth) : undefined
          }
        });
      }
    }
    
    // Sort matches by score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
    
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
};

// Update match status
export const updateMatchStatus = async (
  matchId: number, 
  userId: number, 
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    // Get the match to verify the user is part of it
    const matches = await query(
      'SELECT * FROM matches WHERE id = ?',
      [matchId]
    );
    
    if (!Array.isArray(matches) || matches.length === 0) {
      throw new Error('Match not found');
    }
    
    const match = matches[0];
    
    // Check if the user is part of this match
    if (match.user_id_1 !== userId && match.user_id_2 !== userId) {
      throw new Error('User is not part of this match');
    }
    
    // Update the match status
    await query(
      'UPDATE matches SET status = ? WHERE id = ?',
      [status, matchId]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating match status:', error);
    return false;
  }
};
