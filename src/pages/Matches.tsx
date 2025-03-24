
import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import MatchCard from '@/components/matches/MatchCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Heart, PlusCircle, Star } from 'lucide-react';
import { useMatches } from '@/hooks/use-matches';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

const Matches = () => {
  const { matches, isLoading, activeTab, setActiveTab, acceptMatch, rejectMatch } = useMatches();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] py-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
          
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-serif font-semibold mb-1">Your Matches</h1>
                <p className="text-muted-foreground">Our AI has found these compatible matches for you</p>
              </div>
              
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full md:w-auto">
                <TabsList className="w-full md:w-auto bg-white/50 backdrop-blur-sm">
                  <TabsTrigger value="recommended" className="flex-1 md:flex-initial">
                    <Star className="w-4 h-4 mr-1" />
                    Recommended
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex-1 md:flex-initial">
                    <PlusCircle className="w-4 h-4 mr-1" />
                    New
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1 md:flex-initial">
                    <Heart className="w-4 h-4 mr-1" />
                    Favorites
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-muted-foreground">Finding your matches...</p>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                    <div className="bg-white/30 backdrop-blur-sm p-6 rounded-lg shadow-sm mb-4">
                      <h3 className="text-lg font-medium mb-2">No matches found</h3>
                      <p className="text-muted-foreground">
                        {activeTab === 'recommended' 
                          ? "We're still looking for your perfect matches. Check back later!"
                          : activeTab === 'new' 
                            ? "You've reviewed all your new matches. Great job!"
                            : "You haven't favorited any matches yet."}
                      </p>
                    </div>
                    
                    {activeTab !== 'new' && (
                      <Button 
                        variant="outline" 
                        className="bg-white/20 border-white/30 hover:bg-white/30"
                        onClick={() => setActiveTab('new')}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Explore New Matches
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {matches.map((match, index) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                          <MatchCard 
                            match={{
                              id: match.id,
                              name: match.matchedUser.name,
                              age: match.matchedUser.age || 25,
                              location: match.matchedUser.location || "Unknown",
                              bio: match.matchedUser.bio || "No bio provided",
                              image: match.matchedUser.avatar || "/placeholder.svg",
                              compatibility: Math.round(match.matchScore * 100),
                              interests: ["AI Dating", "Technology"]
                            }}
                            onAccept={() => acceptMatch(match.id)}
                            onReject={() => rejectMatch(match.id)}
                            isFavorite={match.status === 'accepted'}
                          />
                        </motion.div>
                      ))}
                    </div>
                    
                    {matches.length >= 4 && (
                      <div className="flex justify-center mt-12">
                        <Button variant="outline" className="bg-white/20 border-white/30 hover:bg-white/30">
                          Load More Matches
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Matches;
