
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Questionnaire from "./pages/Questionnaire";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import MemoryTree from "./pages/MemoryTree";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Create a component to check if the user has completed the questionnaire
const useHasCompletedQuestionnaire = (userId: string) => {
  const [hasCompleted, setHasCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkQuestionnaire = async () => {
      if (!userId) {
        setHasCompleted(false);
        setIsLoading(false);
        return;
      }

      try {
        // First check if the questions table has any records
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('count')
          .single();
        
        if (questionsError) {
          console.error('Error checking questions:', questionsError);
        }
        
        // If there are no questions, consider questionnaire as completed
        const hasQuestions = questions && questions.count > 0;
        
        if (!hasQuestions) {
          console.log('No questions in database, considering questionnaire completed');
          setHasCompleted(true);
          setIsLoading(false);
          return;
        }
        
        // If there are questions, check if the user has answered any
        const { data, error } = await supabase
          .from('user_answers')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        
        if (error) {
          console.error('Error checking questionnaire completion:', error);
          setHasCompleted(false);
        } else {
          setHasCompleted(data && data.length > 0);
        }
      } catch (err) {
        console.error('Error checking questionnaire completion:', err);
        setHasCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkQuestionnaire();
  }, [userId]);

  return { hasCompletedQuestionnaire: hasCompleted, isLoading };
};

// Component to handle protected routes
const ProtectedRoute = ({ children, requireProfile = true, requireQuestionnaire = true }: { 
  children: React.ReactNode, 
  requireProfile?: boolean,
  requireQuestionnaire?: boolean 
}) => {
  const { user, loading, hasCompletedProfile } = useAuth();
  const location = useLocation();
  
  // Check if questionnaire is completed
  const { hasCompletedQuestionnaire, isLoading: questionnaireLoading } = 
    user ? useHasCompletedQuestionnaire(user.id) : { hasCompletedQuestionnaire: false, isLoading: false };
  
  const isAuthLoading = loading || questionnaireLoading;
  
  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If user needs to complete profile and hasn't yet (and they're not already on the profile page)
  if (requireProfile && !hasCompletedProfile && location.pathname !== '/profile') {
    console.log('User needs to complete profile, redirecting to profile page');
    return <Navigate to="/profile" replace />;
  }
  
  // If user needs to complete questionnaire and hasn't yet (and they're not already on the questionnaire page)
  // Only redirect to questionnaire if there are actually questions to answer
  if (requireQuestionnaire && !hasCompletedQuestionnaire && hasCompletedProfile && location.pathname !== '/questionnaire') {
    console.log('User needs to complete questionnaire, redirecting to questionnaire page');
    return <Navigate to="/questionnaire" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      try {
        setIsInitialized(true);
        console.log("Application initialized successfully");
      } catch (error) {
        console.error("Failed to initialize application:", error);
        toast.error("Failed to initialize application");
        setIsInitialized(true); // Continue anyway
      }
    };
    
    init();
  }, []);
  
  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Initializing...</h2>
          <p className="text-muted-foreground">Setting up the application, please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={
                  <ProtectedRoute requireProfile={false} requireQuestionnaire={false}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/questionnaire" element={
                  <ProtectedRoute requireQuestionnaire={false}>
                    <Questionnaire />
                  </ProtectedRoute>
                } />
                <Route path="/matches" element={
                  <ProtectedRoute>
                    <Matches />
                  </ProtectedRoute>
                } />
                <Route path="/chat/:id" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/memory-tree/:id" element={
                  <ProtectedRoute>
                    <MemoryTree />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
