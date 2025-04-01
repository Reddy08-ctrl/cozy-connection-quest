
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import * as matchService from '@/services/matchService';
import { useAuth } from './use-auth';
import { generateRandomInterests } from '@/utils/mockData';

export interface Match {
  id: number;
  user1Id: string;
  user2Id: string;
  matchScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    location: string;
    dateOfBirth: Date;
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
        // Changed function name to match what's in matchService
        const fetchedMatches = await matchService.getUserMatches(user.id);
        setMatches(fetchedMatches);
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
      setMatches(prevMatches => prevMatches.map(match => 
        match.id === matchId 
          ? { ...match, status: 'accepted' } 
          : match
      ));
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
      setMatches(prevMatches => prevMatches.map(match => 
        match.id === matchId 
          ? { ...match, status: 'rejected' } 
          : match
      ));
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
