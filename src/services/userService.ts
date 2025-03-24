
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string; // Changed from number to string
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  gender?: string;
  dateOfBirth?: Date;
  created_at?: Date;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  location: string;
  gender: string;
  dateOfBirth?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<User> => {
  try {
    const { email, password, name } = userData;
    
    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (authError) {
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      throw new Error('Failed to create user');
    }
    
    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting user profile after registration:', profileError);
      // The trigger should have created the profile, but if there's an error,
      // we'll still return what we can
    }
    
    return {
      id: authData.user.id, // This is now a string
      email: authData.user.email!,
      name: profile?.name || name,
      avatar: profile?.avatar,
      bio: profile?.bio,
      location: profile?.location,
      gender: profile?.gender,
      dateOfBirth: profile?.date_of_birth ? new Date(profile.date_of_birth) : undefined,
      created_at: profile?.created_at ? new Date(profile.created_at) : new Date()
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const { email, password } = credentials;
    
    // Login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      throw new Error('Login failed');
    }
    
    // Get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting user profile after login:', profileError);
      throw new Error('Error retrieving user profile');
    }
    
    return {
      id: authData.user.id, // This is now a string
      email: authData.user.email!,
      name: profile?.name || '',
      avatar: profile?.avatar || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      gender: profile?.gender || '',
      dateOfBirth: profile?.date_of_birth ? new Date(profile.date_of_birth) : undefined,
      created_at: profile?.created_at ? new Date(profile.created_at) : new Date()
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: UserProfile): Promise<User> => {
  try {
    const { name, avatar, bio, location, gender, dateOfBirth } = profileData;
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name,
        avatar,
        bio,
        location,
        gender,
        date_of_birth: dateOfBirth
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
    
    return {
      id: data?.id || userId,
      email: data?.email || '',
      name: data?.name || name,
      avatar: data?.avatar || avatar,
      bio: data?.bio || bio,
      location: data?.location || location,
      gender: data?.gender || gender,
      dateOfBirth: data?.date_of_birth ? new Date(data.date_of_birth) : dateOfBirth,
      created_at: data?.created_at ? new Date(data.created_at) : new Date()
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      throw new Error('User not found');
    }
    
    return {
      id: data?.id || userId,
      email: data?.email || '',
      name: data?.name || '',
      avatar: data?.avatar || '',
      bio: data?.bio || '',
      location: data?.location || '',
      gender: data?.gender || '',
      dateOfBirth: data?.date_of_birth ? new Date(data.date_of_birth) : undefined,
      created_at: data?.created_at ? new Date(data.created_at) : new Date()
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
