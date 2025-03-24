
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '@/components/questionnaire/QuestionCard';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/ui/PageTransition';
import { Progress } from '@/components/ui/progress';
import { questions } from '@/utils/mockData';
import { toast } from '@/components/ui/sonner';

const Questionnaire = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate progress
    const progressValue = (currentQuestionIndex / questions.length) * 100;
    setProgress(progressValue);
  }, [currentQuestionIndex]);

  const handleAnswer = (id: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: answer
    }));
  };

  const handleNext = () => {
    if (!answers[questions[currentQuestionIndex].id]) {
      toast.error('Please answer the question before proceeding');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Simulate submitting questionnaire
      navigate('/matches');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

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
                  question={currentQuestion} 
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
