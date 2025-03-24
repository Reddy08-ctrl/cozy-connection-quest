
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setInitialized(true);
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setLoading(true);
            
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
                } else {
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: profile.name,
                    avatar: profile.avatar,
                    bio: profile.bio,
                    location: profile.location,
                    gender: profile.gender,
                    dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
                    created_at: profile.created_at ? new Date(profile.created_at) : undefined
                  });
                }
              } catch (err) {
                console.error('Error processing auth state change:', err);
                setUser(null);
              }
            } else {
              setUser(null);
            }
            
            setLoading(false);
          }
        );
        
        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
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
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
              avatar: profile.avatar,
              bio: profile.bio,
              location: profile.location,
              gender: profile.gender,
              dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
              created_at: profile.created_at ? new Date(profile.created_at) : undefined
            });
          }
        }
        
        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // User state will be updated by the auth state listener
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
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
        throw new Error(error.message);
      }
      
      toast.success('Registration successful! Check your email to confirm your account.');
      // User state will be updated by the auth state listener
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error signing out');
      }
      
      // User state will be updated by the auth state listener
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error signing out');
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
        logout
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
