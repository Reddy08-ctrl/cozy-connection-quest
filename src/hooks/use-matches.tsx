
import { useState, useEffect } from 'react';
import { getUserMatches, updateMatchStatus, Match } from '@/services/matchService';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommended' | 'new' | 'favorites'>('recommended');

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const fetchedMatches = await getUserMatches(user.id);
        setMatches(fetchedMatches);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch matches';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const acceptMatch = async (matchId: number): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to accept matches');
      return false;
    }

    try {
      const success = await updateMatchStatus(matchId, user.id, 'accepted');
      
      if (success) {
        // Update the local state
        setMatches(prev => 
          prev.map(match => 
            match.id === matchId 
              ? { ...match, status: 'accepted' } 
              : match
          )
        );
        
        toast.success('Match accepted!');
        return true;
      } else {
        throw new Error('Failed to accept match');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept match';
      toast.error(message);
      return false;
    }
  };

  const rejectMatch = async (matchId: number): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to reject matches');
      return false;
    }

    try {
      const success = await updateMatchStatus(matchId, user.id, 'rejected');
      
      if (success) {
        // Update the local state
        setMatches(prev => 
          prev.map(match => 
            match.id === matchId 
              ? { ...match, status: 'rejected' } 
              : match
          )
        );
        
        toast.success('Match rejected');
        return true;
      } else {
        throw new Error('Failed to reject match');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject match';
      toast.error(message);
      return false;
    }
  };

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'recommended') {
      return match.status === 'pending' && match.matchScore >= 0.7;
    } else if (activeTab === 'new') {
      return match.status === 'pending';
    } else if (activeTab === 'favorites') {
      return match.status === 'accepted';
    }
    return true;
  });

  return {
    matches: filteredMatches,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    acceptMatch,
    rejectMatch
  };
};
