
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  // Function to check if user has completed their profile
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Profile is complete if it has name, bio, location, and gender filled out
      const isComplete = profile && 
        profile.name && 
        profile.bio && 
        profile.location && 
        profile.gender;
      
      setHasCompletedProfile(!!isComplete);
      return !!isComplete;
    } catch (err) {
      console.error('Error checking profile completion:', err);
      setHasCompletedProfile(false);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, !!session);
            
            if (session?.user) {
              try {
                // Get the user profile
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                
                if (profileError) {
                  console.error('Error getting user profile from session:', profileError);
                  setUser(null);
                  setHasCompletedProfile(false);
                } else if (profile) {
                  const userData = {
                    id: session.user.id,
                    email: session.user.email!,
                    name: profile.name || '',
                    avatar: profile.avatar || null,
                    bio: profile.bio || null,
                    location: profile.location || null,
                    gender: profile.gender || null,
                    dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
                    created_at: profile.created_at ? new Date(profile.created_at) : undefined
                  };
                  
                  console.log('User data set from profile:', userData.id);
                  setUser(userData);
                  
                  // Check if profile is complete
                  const isComplete = !!(profile.name && profile.bio && profile.location && profile.gender);
                  setHasCompletedProfile(isComplete);
                }
              } catch (err) {
                console.error('Error processing auth state change:', err);
                setUser(null);
                setHasCompletedProfile(false);
              }
            } else {
              console.log('No session user, setting user to null');
              setUser(null);
              setHasCompletedProfile(false);
            }
            
            setLoading(false);
          }
        );
        
        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', !!session);
        
        if (session?.user) {
          // Get the user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error getting user profile from initial session:', profileError);
            setUser(null);
            setHasCompletedProfile(false);
          } else if (profile) {
            const userData = {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || '',
              avatar: profile.avatar || null,
              bio: profile.bio || null,
              location: profile.location || null,
              gender: profile.gender || null,
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
              created_at: profile.created_at ? new Date(profile.created_at) : undefined
            };
            
            console.log('Initial user data set from session:', userData.id);
            setUser(userData);
            
            // Check if profile is complete
            const isComplete = !!(profile.name && profile.bio && profile.location && profile.gender);
            setHasCompletedProfile(isComplete);
          }
        }
        
        setInitialized(true);
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', credentials.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message);
      }
      
      console.log('Login successful:', !!data.user);
      
      // Explicitly set loading to false on success
      setLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error caught:', message);
      setError(message);
      toast.error(message);
      setLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting registration with:', data.email);
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        throw new Error(error.message);
      }
      
      console.log('Registration successful');
      toast.success('Registration successful! Check your email to confirm your account.');
      
      // Explicitly set loading to false on success
      setLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      console.error('Registration error caught:', message);
      setError(message);
      toast.error(message);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error signing out');
      } else {
        console.log('Logout successful');
      }
      
      // Explicitly set loading to false and clear user on logout
      setUser(null);
      setHasCompletedProfile(false);
      setLoading(false);
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error signing out');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        initialized,
        login,
        register,
        logout,
        hasCompletedProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
