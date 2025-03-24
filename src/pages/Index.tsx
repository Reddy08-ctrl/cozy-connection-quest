
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white/10 backdrop-blur-md z-10">
        <div className="text-2xl font-serif font-medium text-gradient">
          Heartful
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            className="bg-white/20 border-white/30 hover:bg-white/30"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight tracking-tight">
                Find your perfect match with <span className="text-gradient">AI</span> precision
              </h1>
            </motion.div>
            
            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl text-muted-foreground"
            >
              Our advanced AI analyzes your unique personality and preferences to find meaningful connections beyond just appearances.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-md group"
              >
                Get Started
                <Heart className="ml-2 w-5 h-5 group-hover:text-red-200 transition-colors" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/20 border-white/30 hover:bg-white/30 text-md"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm z-0" />
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 z-[-1]"
          >
            <img 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
              alt="Couple walking hand in hand" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="relative h-full w-full flex items-center justify-center p-12 z-[1]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="glass rounded-2xl p-6 max-w-md"
            >
              <h3 className="text-2xl font-medium text-white mb-3">How It Works</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="bg-white/20 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-white">1</span>
                  </div>
                  <span className="text-white/90">Create your profile with unique preferences</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-white/20 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-white">2</span>
                  </div>
                  <span className="text-white/90">Answer our specially designed questionnaire</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-white/20 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-white">3</span>
                  </div>
                  <span className="text-white/90">Receive AI-powered matches based on compatibility</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-white/20 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium text-white">4</span>
                  </div>
                  <span className="text-white/90">Connect with meaningful conversations</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
