
import { supabase } from '@/integrations/supabase/client';
import { User, getUserProfile } from './userService';

export interface Match {
  id: number;
  user: User;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  isFavorite?: boolean;
}

// Get all potential matches for a user (excludes already matched users)
export const getPotentialMatches = async (userId: string): Promise<User[]> => {
  try {
    // In a real app, this would implement complex matching logic
    // For now, we'll fetch all profiles except the current user
    const { data: potentialMatches, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .limit(10);
    
    if (error) {
      console.error('Error getting potential matches:', error);
      return [];
    }
    
    return (potentialMatches || []).map(profile => ({
      id: profile?.id || '',
      email: profile?.email || '',
      name: profile?.name || '',
      avatar: profile?.avatar || '', 
      bio: profile?.bio || '',
      location: profile?.location || '',
      gender: profile?.gender || '',
      dateOfBirth: profile?.date_of_birth ? new Date(profile.date_of_birth) : undefined,
      created_at: profile?.created_at ? new Date(profile.created_at) : new Date()
    }));
  } catch (error) {
    console.error('Error getting potential matches:', error);
    return [];
  }
};

// Create a match between two users
export const createMatch = async (
  userId: string, 
  matchUserId: string, 
  matchScore: number
): Promise<Match | null> => {
  try {
    // Check if a match already exists
    const { data: existingMatches, error: checkError } = await supabase
      .from('matches')
      .select('*')
      .or(`and(user_id_1.eq.${userId},user_id_2.eq.${matchUserId}),and(user_id_1.eq.${matchUserId},user_id_2.eq.${userId})`);
    
    if (checkError) {
      console.error('Error checking existing match:', checkError);
      return null;
    }
    
    if (existingMatches && existingMatches.length > 0) {
      // Match already exists, return it
      const match = existingMatches[0];
      
      return {
        id: match.id,
        matchScore: match.match_score,
        status: match.status,
        createdAt: new Date(match.created_at),
        user: await getUserProfile(match.user_id_1 === userId ? match.user_id_2 : match.user_id_1)
      };
    }
    
    // Create a new match
    const { data: newMatch, error: insertError } = await supabase
      .from('matches')
      .insert({
        user_id_1: userId,
        user_id_2: matchUserId,
        match_score: matchScore,
        status: 'pending'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating match:', insertError);
      return null;
    }
    
    if (!newMatch) {
      console.error('Failed to create match: No data returned');
      return null;
    }
    
    // Get match user details
    const matchUser = await getUserProfile(matchUserId);
    
    if (!matchUser) {
      console.error('Failed to get match user details');
      return null;
    }
    
    return {
      id: newMatch.id,
      user: matchUser,
      matchScore: newMatch.match_score,
      status: newMatch.status as 'pending' | 'accepted' | 'rejected',
      createdAt: new Date(newMatch.created_at)
    };
  } catch (error) {
    console.error('Error creating match:', error);
    return null;
  }
};

// Update a match status (accept or reject)
export const updateMatchStatus = async (
  matchId: number, 
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId);
    
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

// Get all matches for a user
export const getUserMatches = async (userId: string): Promise<Match[]> => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        profiles!matches_user_id_1_fkey(*),
        profiles!matches_user_id_2_fkey(*)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user matches:', error);
      return [];
    }
    
    const formattedMatches = [];
    
    for (const match of (matches || [])) {
      const isUser1 = match.user_id_1 === userId;
      const otherUserProfile = isUser1 ? match.profiles?.['matches_user_id_2_fkey'] : match.profiles?.['matches_user_id_1_fkey'];
      
      if (!otherUserProfile) {
        console.error('Match user data is missing for match:', match.id);
        continue;
      }
      
      formattedMatches.push({
        id: match.id,
        user: {
          id: otherUserProfile.id,
          email: otherUserProfile.email,
          name: otherUserProfile.name,
          avatar: otherUserProfile.avatar || '',
          bio: otherUserProfile.bio,
          location: otherUserProfile.location,
          gender: otherUserProfile.gender,
          dateOfBirth: otherUserProfile.date_of_birth ? new Date(otherUserProfile.date_of_birth) : undefined,
          created_at: otherUserProfile.created_at ? new Date(otherUserProfile.created_at) : new Date()
        },
        matchScore: match.match_score,
        status: match.status,
        createdAt: new Date(match.created_at)
      });
    }
    
    return formattedMatches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    return [];
  }
};

// Get favorite matches for a user
export const getFavoriteMatches = async (userId: string): Promise<Match[]> => {
  // In a real app, this would fetch from a favorites table
  // For now, we'll just simulate by returning the top 5 matches
  const matches = await getUserMatches(userId);
  
  return matches
    .filter(match => match.status === 'accepted')
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(match => ({ ...match, isFavorite: true }));
};

// Add a match to favorites
export const addMatchToFavorites = async (matchId: number): Promise<boolean> => {
  // This would store in a favorites table in a real app
  console.log(`Added match ${matchId} to favorites`);
  return true;
};

// Remove a match from favorites
export const removeMatchFromFavorites = async (matchId: number): Promise<boolean> => {
  // This would remove from a favorites table in a real app
  console.log(`Removed match ${matchId} from favorites`);
  return true;
};

// Accept a match
export const acceptMatch = async (matchId: number): Promise<boolean> => {
  return await updateMatchStatus(matchId, 'accepted');
};

// Reject a match
export const rejectMatch = async (matchId: number): Promise<boolean> => {
  return await updateMatchStatus(matchId, 'rejected');
};
