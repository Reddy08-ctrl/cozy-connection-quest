
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { scaleIn } from '@/utils/animations';

type FormType = 'login' | 'register';

const AuthForm = () => {
  const [formType, setFormType] = useState<FormType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register, initialized, user } = useAuth();

  // Add effect to check if we're already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const toggleFormType = () => {
    setFormType(formType === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let success = false;
      
      if (formType === 'login') {
        console.log('Attempting login with credentials');
        // Use Supabase directly for more reliable authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Login error:', error.message);
          toast.error(error.message || 'Login failed');
          setIsSubmitting(false);
          return;
        }
        
        if (data.user) {
          console.log('Login succeeded via direct Supabase auth, redirecting...');
          toast.success('Login successful');
          // Clear form
          setEmail('');
          setPassword('');
          setName('');
          // Navigate to profile on success
          navigate('/profile');
        }
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name');
          setIsSubmitting(false);
          return;
        }
        
        success = await register({ email, password, name });
        if (success) {
          toast.success('Registration successful! Check your email for verification.');
          // Clear form
          setEmail('');
          setPassword('');
          setName('');
        } else {
          console.log('Registration failed, no success returned');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      {...scaleIn}
      className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold tracking-tight mb-1">
          {formType === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {formType === 'login'
            ? 'Enter your credentials to sign in'
            : 'Fill out the form to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formType === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full animate-pulse-light hover:animate-none" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {formType === 'login' ? 'Signing In...' : 'Creating Account...'}
            </span>
          ) : (
            formType === 'login' ? 'Sign In' : 'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={toggleFormType}
          className="text-sm text-muted-foreground hover:text-primary transition-colors subtle-link"
          type="button"
        >
          {formType === 'login'
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthForm;
