import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useQuestionnaire } from '@/hooks/use-questionnaire';
import QuestionCard from '@/components/questionnaire/QuestionCard';

const Questionnaire = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { 
    questions, 
    answers, 
    setAnswer, 
    submitAnswers, 
    hasCompletedQuestionnaire,
    isLoading 
  } = useQuestionnaire();

  // If questionnaire is already completed, redirect to matches
  useEffect(() => {
    if (hasCompletedQuestionnaire === true && !isLoading) {
      console.log('Questionnaire already completed, redirecting to matches');
      navigate('/matches');
    }
  }, [hasCompletedQuestionnaire, isLoading, navigate]);

  // Redirect to matches if there are no questions
  useEffect(() => {
    if (!isLoading && questions.length === 0) {
      console.log('No questions available, redirecting to matches');
      toast.info('No questionnaire questions are available. Redirecting to matches.');
      navigate('/matches');
    }
  }, [questions, isLoading, navigate]);

  useEffect(() => {
    if (questions.length > 0) {
      // Calculate progress
      const progressValue = (currentQuestionIndex / questions.length) * 100;
      setProgress(progressValue);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleAnswer = (questionId: number, answer: string) => {
    console.log('Setting answer for question:', questionId, 'Answer:', answer);
    setAnswer(questionId, answer);
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      console.error('Current question is undefined');
      return;
    }
    
    if (!answers[currentQuestion.id]) {
      toast.error('Please answer the question before proceeding');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Submit questionnaire
      console.log('Submitting questionnaire with answers:', answers);
      const success = await submitAnswers();
      if (success) {
        toast.success('Questionnaire completed!');
        // Navigate to matches page
        navigate('/matches');
      } else {
        toast.error('Failed to submit answers. Please try again.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading questionnaire...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // We don't need this check anymore since we're redirecting in the useEffect
  // but keeping a simpler version as a fallback
  if (questions.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-serif mb-4">No Questions Available</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any questions. Redirecting to matches page...
            </p>
            <Button onClick={() => navigate('/matches')}>Go to Matches</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No questions available.</p>
            <Button onClick={() => navigate('/matches')} className="mt-4">Go to Matches</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="min-h-[calc(100vh-4rem)] py-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-[-1]" />
          
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-serif font-semibold mb-2"
              >
                Let's Get to Know You
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                Answer these questions to help our AI find your perfect matches
              </motion.p>
            </div>
            
            <div className="mb-8 relative">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <div key={currentQuestionIndex} className="mb-10">
                <QuestionCard 
                  question={{
                    id: currentQuestion.id,
                    text: currentQuestion.question,
                    type: 'text', // Default to text, could be extended later
                  }}
                  onAnswer={handleAnswer} 
                />
              </div>
            </AnimatePresence>
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="bg-white/20 border-white/30 hover:bg-white/30"
              >
                Previous
              </Button>
              
              <Button onClick={handleNext}>
                {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Questionnaire;
