
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthForm from '@/components/auth/AuthForm';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, initialized } = useAuth();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    console.log('Auth page - User:', !!user, 'Loading:', loading, 'Initialized:', initialized);
    
    if (user && !loading && initialized) {
      console.log('Auth page - Authenticated user detected, redirecting');
      // First check profile completion
      if (!user.bio || !user.location || !user.gender) {
        console.log('Auth page - Profile incomplete, redirecting to profile page');
        navigate('/profile');
      } else {
        // If profile is complete, check questionnaire completion via Supabase directly
        const checkQuestionnaire = async () => {
          try {
            console.log('Auth page - Checking questionnaire completion for user:', user.id);
            const { data, error } = await supabase
              .from('user_answers')
              .select('id')
              .eq('user_id', user.id)
              .limit(1);
            
            if (error) {
              console.error('Error checking questionnaire completion from Supabase:', error);
              throw new Error(error.message);
            }
            
            const hasCompletedQuestionnaire = data && data.length > 0;
            console.log('Auth page - Questionnaire completed:', hasCompletedQuestionnaire);
            
            if (hasCompletedQuestionnaire) {
              navigate('/matches');
            } else {
              navigate('/questionnaire');
            }
          } catch (err) {
            console.error('Error checking questionnaire status:', err);
            // Default to questionnaire page if we can't determine status
            navigate('/questionnaire');
          }
        };
        
        checkQuestionnaire();
      }
    }
  }, [user, loading, initialized, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 flex items-center">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back</span>
        </button>
        <div className="mx-auto text-lg font-serif text-gradient">
          Heartful
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-screen-lg flex flex-col-reverse md:flex-row items-center gap-8 lg:gap-16"
        >
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <AuthForm />
          </div>
          
          <div className="w-full md:w-1/2 space-y-6 md:p-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold leading-tight">
                Welcome to a more <span className="text-gradient">meaningful</span> way to connect
              </h1>
              <p className="mt-4 text-muted-foreground">
                Join thousands of users who've found more authentic relationships through our AI-powered matching system.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Personalized Matches</h3>
                  <p className="text-sm text-muted-foreground">Our AI analyzes your preferences to find truly compatible partners</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Beyond Surface Attributes</h3>
                  <p className="text-sm text-muted-foreground">We focus on personality and values, not just photos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Privacy Focused</h3>
                  <p className="text-sm text-muted-foreground">Your data is secure and only used to improve your matches</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
