
import React from 'react';
import { motion } from 'framer-motion';
import ProfileForm from '@/components/profile/ProfileForm';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import { useAuth } from '@/hooks/use-auth';

const Profile = () => {
  const { hasCompletedProfile } = useAuth();
  const isEditMode = hasCompletedProfile;

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
