
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import MatchCard from '@/components/matches/MatchCard';
import { matches } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const Matches = () => {
  const [loading, setLoading] = useState(true);
  const [displayedMatches, setDisplayedMatches] = useState([]);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setDisplayedMatches(matches);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
              
              <Tabs defaultValue="recommended" className="w-full md:w-auto">
                <TabsList className="w-full md:w-auto bg-white/50 backdrop-blur-sm">
                  <TabsTrigger value="recommended" className="flex-1 md:flex-initial">Recommended</TabsTrigger>
                  <TabsTrigger value="new" className="flex-1 md:flex-initial">New</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1 md:flex-initial">Favorites</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {loading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-12">
                  <Button variant="outline" className="bg-white/20 border-white/30 hover:bg-white/30">
                    Load More Matches
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Matches;
