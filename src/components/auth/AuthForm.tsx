
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

type FormType = 'login' | 'register';

const AuthForm = () => {
  const [formType, setFormType] = useState<FormType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const toggleFormType = () => {
    setFormType(formType === 'login' ? 'register' : 'login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes only
    if (formType === 'login') {
      toast.success('Login successful');
      navigate('/profile');
    } else {
      toast.success('Registration successful');
      navigate('/profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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

        <Button type="submit" className="w-full">
          {formType === 'login' ? 'Sign In' : 'Create Account'}
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
