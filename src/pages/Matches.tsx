
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import MatchCard from '@/components/matches/MatchCard';
import { useMatches } from '@/hooks/use-matches';
import { useNavigate } from 'react-router-dom';

const calculateAge = (dateOfBirth?: Date): number => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
};

const MatchesPage = () => {
  const navigate = useNavigate();
  const { 
    matches, 
    isLoading, 
    error, 
    activeTab, 
    setActiveTab,
    acceptMatch,
    rejectMatch 
  } = useMatches();
  
  const handleAccept = async (matchId: number) => {
    const success = await acceptMatch(matchId);
    if (success) {
      // Could navigate to chat or show a success message
    }
  };
  
  const handleReject = async (matchId: number) => {
    await rejectMatch(matchId);
  };
  
  const handleViewProfile = (userId: string) => {
    // In a real app, this would navigate to a profile view page
    console.log('Viewing profile:', userId);
  };
  
  const handleMessage = (userId: string) => {
    navigate(`/chat/${userId}`);
  };
  
  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
          
          <div className="max-w-screen-xl mx-auto">
            <div className="mb-8 text-center">
              <motion.h1 
                className="text-3xl md:text-4xl font-serif font-semibold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Your Matches
              </motion.h1>
              <motion.p 
                className="text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Connect with people who share your interests and values
              </motion.p>
            </div>
            
            <Tabs 
              defaultValue="recommended" 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'recommended' | 'new' | 'favorites')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="new">New Matches</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommended" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        name={match.matchedUser.name}
                        age={calculateAge(match.matchedUser.dateOfBirth)}
                        location={match.matchedUser.location || 'Unknown location'}
                        bio={match.matchedUser.bio || 'No bio provided'}
                        avatar={match.matchedUser.avatar}
                        matchScore={match.matchScore}
                        onAccept={() => handleAccept(match.id)}
                        onReject={() => handleReject(match.id)}
                        onViewProfile={() => handleViewProfile(match.matchedUser.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No recommended matches found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/questionnaire')}
                    >
                      Complete your questionnaire to get matches
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="new" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        name={match.matchedUser.name}
                        age={calculateAge(match.matchedUser.dateOfBirth)}
                        location={match.matchedUser.location || 'Unknown location'}
                        bio={match.matchedUser.bio || 'No bio provided'}
                        avatar={match.matchedUser.avatar}
                        matchScore={match.matchScore}
                        onAccept={() => handleAccept(match.id)}
                        onReject={() => handleReject(match.id)}
                        onViewProfile={() => handleViewProfile(match.matchedUser.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No new matches found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="favorites" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        name={match.matchedUser.name}
                        age={calculateAge(match.matchedUser.dateOfBirth)}
                        location={match.matchedUser.location || 'Unknown location'}
                        bio={match.matchedUser.bio || 'No bio provided'}
                        avatar={match.matchedUser.avatar}
                        matchScore={match.matchScore}
                        isFavorite={true}
                        onMessage={() => handleMessage(match.matchedUser.id)}
                        onViewProfile={() => handleViewProfile(match.matchedUser.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No favorites yet</p>
                    <p className="text-sm mt-2">Accept matches to add them to your favorites</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default MatchesPage;
