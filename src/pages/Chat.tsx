
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import ChatInterface from '@/components/chat/ChatInterface';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/services/userService';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMatch = async () => {
      if (!user || !id) {
        setLoading(false);
        return;
      }
      
      try {
        // Get the matched user's profile
        const matchUser = await getUserProfile(id);
        
        if (matchUser) {
          setMatch({
            id,
            name: matchUser.name,
            avatar: matchUser.avatar || '/placeholder.svg',
            bio: matchUser.bio || '',
            location: matchUser.location || 'Unknown',
            lastActive: new Date()
          });
        }
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatch();
  }, [id, user]);
  
  useEffect(() => {
    // Set up real-time subscription for new messages
    if (!user || !id) return;
    
    const subscription = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          // If we're in a chat with the sender, the ChatInterface will handle this
          console.log('New message received via real-time:', payload);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, user]);
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!match) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-medium">Conversation not found</h2>
            <p className="text-muted-foreground">The person you're looking for doesn't exist or is no longer available.</p>
            <Button onClick={() => navigate('/matches')}>Return to Matches</Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
          
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button 
                variant="ghost" 
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors pl-0"
                onClick={() => navigate('/matches')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back to Matches</span>
              </Button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <ChatInterface match={match} currentUserId={user?.id} />
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Chat;
