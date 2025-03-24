
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import ChatInterface from '@/components/chat/ChatInterface';
import { matches } from '@/utils/mockData';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Find the matching user
    const foundMatch = matches.find(m => m.id === id);
    
    // Simulate API delay
    setTimeout(() => {
      setMatch(foundMatch);
      setLoading(false);
    }, 500);
  }, [id]);
  
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
              <ChatInterface match={match} currentUserId="current-user" />
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Chat;
