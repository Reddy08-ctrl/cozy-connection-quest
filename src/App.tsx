
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { initializeDatabase } from "@/services/database";
import { toast } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Questionnaire from "./pages/Questionnaire";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database (now only localStorage)
        await initializeDatabase();
        setIsInitialized(true);
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Failed to initialize database:", error);
        toast.error("Failed to initialize database");
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
                <Route path="/profile" element={<Profile />} />
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/chat/:id" element={<Chat />} />
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
