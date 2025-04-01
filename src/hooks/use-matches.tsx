
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as matchService from '@/services/matchService';
import { useAuth } from './use-auth';

export interface Match {
  id: number;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    dateOfBirth?: Date;
  };
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommended' | 'new' | 'favorites'>('recommended');
  const { user } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);

      try {
        const fetchedMatches = await matchService.getUserMatches(user.id);
        // Convert the fetched matches to our internal Match type
        const formattedMatches: Match[] = fetchedMatches.map(match => ({
          id: match.id,
          matchScore: match.matchScore,
          status: match.status,
          createdAt: match.createdAt,
          user: {
            id: match.user.id,
            name: match.user.name || '',
            avatar: match.user.avatar || '',
            bio: match.user.bio || '',
            location: match.user.location || '',
            dateOfBirth: match.user.dateOfBirth
          }
        }));
        setMatches(formattedMatches);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch matches';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const handleAcceptMatch = async (matchId: number) => {
    try {
      await matchService.updateMatchStatus(matchId, 'accepted');
      setMatches(prevMatches => prevMatches?.map(match => 
        match.id === matchId 
          ? { ...match, status: 'accepted' } 
          : match
      ) ?? null);
      return true;
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match');
      return false;
    }
  };

  const handleRejectMatch = async (matchId: number) => {
    try {
      await matchService.updateMatchStatus(matchId, 'rejected');
      setMatches(prevMatches => prevMatches?.map(match => 
        match.id === matchId 
          ? { ...match, status: 'rejected' } 
          : match
      ) ?? null);
      return true;
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error('Failed to reject match');
      return false;
    }
  };

  return {
    matches,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    acceptMatch: handleAcceptMatch,
    rejectMatch: handleRejectMatch
  };
};
