
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/services/userService';
import { getUserAnswers } from '@/services/questionnaireService';

export interface Match {
  id: number;
  userId: string; // Changed from number to string
  matchedUser: User;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Helper function to calculate match score
const calculateMatchScore = async (userId: string, potentialMatchId: string): Promise<number> => {
  try {
    // Get answers for both users
    const userAnswers = await getUserAnswers(userId);
    const matchAnswers = await getUserAnswers(potentialMatchId);
    
    if (userAnswers.length === 0 || matchAnswers.length === 0) {
      // If either user hasn't answered questions, return a default score
      return 0.5;
    }
    
    // Create maps of question ID to answer for easy comparison
    const userAnswerMap = new Map(userAnswers.map(a => [a.questionId, a.answer]));
    const matchAnswerMap = new Map(matchAnswers.map(a => [a.questionId, a.answer]));
    
    // Find common questions
    const commonQuestionIds = [...userAnswerMap.keys()].filter(id => matchAnswerMap.has(id));
    
    if (commonQuestionIds.length === 0) {
      // If no common questions, return a default score
      return 0.5;
    }
    
    // Calculate similarity score based on common answers
    let similarityScore = 0;
    
    for (const questionId of commonQuestionIds) {
      const userAnswer = userAnswerMap.get(questionId) || '';
      const matchAnswer = matchAnswerMap.get(questionId) || '';
      
      // Very simple string similarity calculation
      // In a real app, you'd want more sophisticated analysis
      if (userAnswer.toLowerCase() === matchAnswer.toLowerCase()) {
        similarityScore += 1;
      } else {
        // Check for partial matches
        const userWords = new Set(userAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3));
        const matchWords = new Set(matchAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3));
        
        const commonWords = [...userWords].filter(word => matchWords.has(word));
        
        if (commonWords.length > 0) {
          similarityScore += 0.5 * (commonWords.length / Math.max(userWords.size, matchWords.size));
        }
      }
    }
    
    // Normalize score between 0 and 1
    return similarityScore / commonQuestionIds.length;
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0.5; // Default score on error
  }
};

// Find matches for a user
export const findMatches = async (userId: string): Promise<Match[]> => {
  try {
    // Get all profiles except the current user
    const { data: potentialMatches, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId);
    
    if (profilesError) {
      console.error('Error finding potential matches:', profilesError);
      return [];
    }
    
    // Check existing matches to avoid duplicates
    const { data: existingMatches, error: matchesError } = await supabase
      .from('matches')
      .select('user_id_1, user_id_2, id, match_score, status, created_at')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
    
    if (matchesError) {
      console.error('Error checking existing matches:', matchesError);
      return [];
    }
    
    // Map of user IDs to existing match data
    const existingMatchMap = new Map();
    
    for (const match of existingMatches || []) {
      const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
      existingMatchMap.set(otherUserId, {
        id: match.id,
        score: match.match_score,
        status: match.status,
        createdAt: match.created_at
      });
    }
    
    // Process each potential match
    const matches: Match[] = [];
    
    for (const profile of potentialMatches || []) {
      if (existingMatchMap.has(profile.id)) {
        // We already have a match with this user
        const existingMatch = existingMatchMap.get(profile.id);
        
        matches.push({
          id: existingMatch.id,
          userId,
          matchedUser: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar: profile.avatar,
            bio: profile.bio,
            location: profile.location,
            gender: profile.gender,
            dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
            created_at: profile.created_at ? new Date(profile.created_at) : undefined
          },
          matchScore: existingMatch.score,
          status: existingMatch.status,
          createdAt: new Date(existingMatch.createdAt)
        });
      } else {
        // Calculate match score for new potential match
        const matchScore = await calculateMatchScore(userId, profile.id);
        
        // Insert the new match
        const { data: newMatch, error: insertError } = await supabase
          .from('matches')
          .insert({
            user_id_1: userId,
            user_id_2: profile.id,
            match_score: matchScore,
            status: 'pending'
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating new match:', insertError);
          continue;
        }
        
        if (newMatch) {
          matches.push({
            id: newMatch.id,
            userId,
            matchedUser: {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatar: profile.avatar,
              bio: profile.bio,
              location: profile.location,
              gender: profile.gender,
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
              created_at: profile.created_at ? new Date(profile.created_at) : undefined
            },
            matchScore,
            status: 'pending',
            createdAt: new Date(newMatch.created_at)
          });
        }
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
};

// Update match status (accept or reject)
export const updateMatchStatus = async (
  matchId: number,
  userId: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    // Update the match status
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
    
    if (error) {
      console.error('Error updating match status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating match status:', error);
    return false;
  }
};

// Get matched users (accepted matches)
export const getAcceptedMatches = async (userId: string): Promise<Match[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        match_score,
        status,
        created_at,
        user_id_1,
        user_id_2,
        profiles:user_id_1(id, email, name, avatar, bio, location, gender, date_of_birth, created_at),
        profiles2:user_id_2(id, email, name, avatar, bio, location, gender, date_of_birth, created_at)
      `)
      .eq('status', 'accepted')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
    
    if (error) {
      console.error('Error getting accepted matches:', error);
      return [];
    }
    
    // Transform the data
    const matches: Match[] = [];
    
    for (const match of data || []) {
      const isUserOne = match.user_id_1 === userId;
      const otherUserProfile = isUserOne ? match.profiles2 : match.profiles;
      
      if (otherUserProfile) {
        matches.push({
          id: match.id,
          userId,
          matchedUser: {
            id: otherUserProfile.id,
            email: otherUserProfile.email,
            name: otherUserProfile.name,
            avatar: otherUserProfile.avatar,
            bio: otherUserProfile.bio,
            location: otherUserProfile.location,
            gender: otherUserProfile.gender,
            dateOfBirth: otherUserProfile.date_of_birth ? new Date(otherUserProfile.date_of_birth) : undefined,
            created_at: otherUserProfile.created_at ? new Date(otherUserProfile.created_at) : undefined
          },
          matchScore: match.match_score,
          status: match.status,
          createdAt: new Date(match.created_at)
        });
      }
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting accepted matches:', error);
    return [];
  }
};
