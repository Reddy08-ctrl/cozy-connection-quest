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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Component to handle protected routes
const ProtectedRoute = ({ children, requireProfile = true }: { children: React.ReactNode, requireProfile?: boolean }) => {
  const { user, loading, hasCompletedProfile } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // If user does not have a complete profile and the route requires a profile (and they're not already on the profile page)
  if (requireProfile && !hasCompletedProfile && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
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
                  <ProtectedRoute requireProfile={false}>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/questionnaire" element={
                  <ProtectedRoute>
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
