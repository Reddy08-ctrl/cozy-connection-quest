
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, Heart, X, MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MatchCard } from '@/components/matches/MatchCard';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import { useMatches } from '@/hooks/use-matches';
import { Match } from '@/services/matchService';
import { differenceInYears } from 'date-fns';

const Matches = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    matches, 
    favoriteMatches, 
    loadingMatches, 
    addToFavorites, 
    removeFromFavorites, 
    acceptMatch, 
    rejectMatch 
  } = useMatches();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
  const [showFavorites, setShowFavorites] = useState(false);
  
  const calculateAge = (dateOfBirth: Date | undefined | null) => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };
  
  const filteredMatches = (showFavorites ? favoriteMatches : matches)
    .filter(match => 
      match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.user.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.matchScore - a.matchScore;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.user.name.localeCompare(b.user.name);
        default:
          return 0;
      }
    });
  
  const handleAddToFavorites = async (matchId: number) => {
    try {
      await addToFavorites(matchId);
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: 'Failed to add to favorites',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const handleRemoveFromFavorites = async (matchId: number) => {
    try {
      await removeFromFavorites(matchId);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: 'Failed to remove from favorites',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const handleAcceptMatch = async (matchId: number) => {
    try {
      const success = await acceptMatch(matchId);
      if (success) {
        toast({
          title: 'Match accepted!',
          description: 'You can now chat with this person.'
        });
      }
      return success;
    } catch (error) {
      console.error('Error accepting match:', error);
      toast({
        title: 'Failed to accept match',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const handleRejectMatch = async (matchId: number) => {
    try {
      const success = await rejectMatch(matchId);
      if (success) {
        toast({
          title: 'Match rejected',
          description: 'The match has been declined.'
        });
      }
      return success;
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast({
        title: 'Failed to reject match',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  const handleMessage = (userId: string) => {
    navigate(`/chat/${userId}`);
  };
  
  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  return (
    <Layout>
      <PageTransition>
        <div className="container max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <h1 className="text-3xl font-serif">Your Matches</h1>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search matches..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Select 
                    value={sortBy} 
                    onValueChange={(value) => setSortBy(value as 'score' | 'date' | 'name')}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Match Score</SelectItem>
                      <SelectItem value="date">Most Recent</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant={showFavorites ? "default" : "outline"} 
                    onClick={() => setShowFavorites(!showFavorites)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Button>
                </div>
              </div>
            </div>
            
            {loadingMatches ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-72"></div>
                ))}
              </div>
            ) : filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    user={match.user}
                    matchScore={match.matchScore}
                    status={match.status}
                    isFavorite={favoriteMatches.some(f => f.id === match.id)}
                    onAccept={() => handleAcceptMatch(match.id)}
                    onReject={() => handleRejectMatch(match.id)}
                    onAddToFavorites={() => handleAddToFavorites(match.id)}
                    onRemoveFromFavorites={() => handleRemoveFromFavorites(match.id)}
                    onMessage={() => handleMessage(match.user.id)}
                    onViewProfile={() => handleViewProfile(match.user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="bg-muted rounded-full p-6">
                  <Heart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-medium">No matches found</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  {showFavorites ? 
                    "You haven't added any matches to your favorites yet." : 
                    "Complete your profile and answer more questions to get better matches."}
                </p>
                {showFavorites && (
                  <Button 
                    onClick={() => setShowFavorites(false)}
                    className="mt-2"
                  >
                    View All Matches
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Matches;
