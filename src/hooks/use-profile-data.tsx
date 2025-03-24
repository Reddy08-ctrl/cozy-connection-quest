
import { useState } from 'react';
import { updateUserProfile, UserProfile } from '@/services/userService';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const useProfileData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async (profileData: UserProfile): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await updateUserProfile(user.id, profileData);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveProfile,
    isLoading,
    error
  };
};
