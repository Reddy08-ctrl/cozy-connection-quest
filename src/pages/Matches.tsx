
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchCard } from '@/components/matches/MatchCard';
import { useMatches } from '@/hooks/use-matches';
import { generateRandomInterests } from '@/utils/mockData';
import { getAge } from '@/lib/utils';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';

const Matches = () => {
  const { 
    matches, 
    isLoading, 
    error, 
    activeTab, 
    setActiveTab,
    acceptMatch,
    rejectMatch 
  } = useMatches();

  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    
    switch (activeTab) {
      case 'new':
        return matches.filter(match => match.status === 'pending');
      case 'favorites':
        return matches.filter(match => match.status === 'accepted');
      case 'recommended':
      default:
        return matches.sort((a, b) => b.matchScore - a.matchScore);
    }
  }, [matches, activeTab]);

  const handleAccept = async (matchId: number) => {
    return await acceptMatch(matchId);
  };

  const handleReject = async (matchId: number) => {
    return await rejectMatch(matchId);
  };

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] py-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
          
          <div className="container max-w-5xl mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h1 className="text-3xl font-serif font-semibold mb-2">
                Discover Your Potential Matches
              </h1>
              <p className="text-muted-foreground">
                Explore our curated list of potential connections
              </p>
            </motion.div>
            
            <Tabs defaultValue="recommended" className="w-full">
              <TabsList className="w-full flex justify-center rounded-full bg-secondary/80 p-1">
                <TabsTrigger value="recommended" onClick={() => setActiveTab('recommended')} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Recommended</TabsTrigger>
                <TabsTrigger value="new" onClick={() => setActiveTab('new')} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">New</TabsTrigger>
                <TabsTrigger value="favorites" onClick={() => setActiveTab('favorites')} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Favorites</TabsTrigger>
              </TabsList>
              <TabsContent value="recommended" className="space-y-4">
                {isLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="text-center text-red-500">
                    Error: {error}
                  </div>
                )}
                
                {!isLoading && !error && filteredMatches && filteredMatches.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    No matches found in recommended.
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {filteredMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={{
                        id: match.id.toString(),
                        name: match.user.name,
                        age: match.user.dateOfBirth ? getAge(match.user.dateOfBirth) : 0,
                        location: match.user.location || 'Unknown',
                        bio: match.user.bio || 'No bio available',
                        avatar: match.user.avatar || 'https://via.placeholder.com/150',
                        compatibility: match.matchScore,
                        interests: generateRandomInterests()
                      }}
                      onAccept={() => handleAccept(match.id)}
                      onReject={() => handleReject(match.id)}
                      isFavorite={match.status === 'accepted'}
                      onToggleFavorite={match.status === 'accepted' 
                        ? () => handleReject(match.id) 
                        : () => handleAccept(match.id)}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="new" className="space-y-4">
                {isLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="text-center text-red-500">
                    Error: {error}
                  </div>
                )}
                
                {!isLoading && !error && filteredMatches && filteredMatches.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    No new matches found.
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {filteredMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={{
                        id: match.id.toString(),
                        name: match.user.name,
                        age: match.user.dateOfBirth ? getAge(match.user.dateOfBirth) : 0,
                        location: match.user.location || 'Unknown',
                        bio: match.user.bio || 'No bio available',
                        avatar: match.user.avatar || 'https://via.placeholder.com/150',
                        compatibility: match.matchScore,
                        interests: generateRandomInterests()
                      }}
                      onAccept={() => handleAccept(match.id)}
                      onReject={() => handleReject(match.id)}
                      isFavorite={match.status === 'accepted'}
                      onToggleFavorite={match.status === 'accepted' 
                        ? () => handleReject(match.id) 
                        : () => handleAccept(match.id)}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="favorites" className="space-y-4">
                {isLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {error && (
                  <div className="text-center text-red-500">
                    Error: {error}
                  </div>
                )}
                
                {!isLoading && !error && filteredMatches && filteredMatches.length === 0 && (
                  <div className="text-center text-muted-foreground">
                    No favorite matches yet.
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {filteredMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={{
                        id: match.id.toString(),
                        name: match.user.name,
                        age: match.user.dateOfBirth ? getAge(match.user.dateOfBirth) : 0,
                        location: match.user.location || 'Unknown',
                        bio: match.user.bio || 'No bio available',
                        avatar: match.user.avatar || 'https://via.placeholder.com/150',
                        compatibility: match.matchScore,
                        interests: generateRandomInterests()
                      }}
                      onAccept={() => handleAccept(match.id)}
                      onReject={() => handleReject(match.id)}
                      isFavorite={match.status === 'accepted'}
                      onToggleFavorite={match.status === 'accepted' 
                        ? () => handleReject(match.id) 
                        : () => handleAccept(match.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Matches;
