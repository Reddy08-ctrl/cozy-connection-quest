
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileForm from '@/components/profile/ProfileForm';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { hasCompletedProfile, user } = useAuth();
  const isEditMode = hasCompletedProfile;
  const navigate = useNavigate();

  // If we're on the profile page directly after login and profile is already completed,
  // redirect to the questionnaire or matches page
  useEffect(() => {
    const checkRedirect = async () => {
      if (hasCompletedProfile && user) {
        // First check if there are any questions
        try {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('count')
            .single();
            
          if (questionsError) {
            console.error('Error checking questions:', questionsError);
          }
          
          // If there are no questions, go directly to matches
          const hasQuestions = questions && questions.count > 0;
          
          if (!hasQuestions) {
            console.log('No questions in database, redirecting to matches');
            navigate('/matches');
            return;
          }
          
          // Check if user has completed questionnaire
          const { data } = await supabase
            .from('user_answers')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          const hasAnswers = data && data.length > 0;
          
          if (hasAnswers) {
            // If both profile and questionnaire are completed, go to matches
            navigate('/matches');
          } else {
            // If profile is completed but questionnaire isn't, go to questionnaire
            navigate('/questionnaire');
          }
        } catch (err) {
          console.error('Error checking questionnaire status:', err);
          // On error, default to matches page
          navigate('/matches');
        }
      }
    };
    
    // Only redirect if not in edit mode (which means we were navigated here explicitly)
    if (hasCompletedProfile && !window.location.href.includes('edit=true')) {
      checkRedirect();
    }
  }, [hasCompletedProfile, user, navigate]);

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] py-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
          <ProfileForm isEditMode={isEditMode} />
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Profile;
