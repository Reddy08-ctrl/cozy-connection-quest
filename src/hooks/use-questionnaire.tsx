
import { useState, useEffect } from 'react';
import { getQuestions, saveUserAnswers, Question, UserAnswer } from '@/services/questionnaireService';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useQuestionnaire = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching questions and user answers for user:', user.id);
        
        // Fetch questions from the database
        const { data: fetchedQuestions, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('id', { ascending: true });
        
        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          throw new Error(questionsError.message);
        }
        
        setQuestions(fetchedQuestions || []);
        console.log('Fetched questions:', fetchedQuestions?.length);
        
        // Check if user has already completed the questionnaire
        const { data: userAnswers, error: answersError } = await supabase
          .from('user_answers')
          .select('*')
          .eq('user_id', user.id);
        
        if (answersError) {
          console.error('Error checking user answers:', answersError);
          throw new Error(answersError.message);
        }
        
        // If user has answers, prefill the form
        const existingAnswers: Record<number, string> = {};
        userAnswers?.forEach(answer => {
          existingAnswers[answer.question_id] = answer.answer;
        });
        
        setAnswers(existingAnswers);
        setHasCompletedQuestionnaire(userAnswers && userAnswers.length > 0);
        console.log('User has completed questionnaire:', userAnswers && userAnswers.length > 0);
        
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch questions';
        console.error('Error in fetchQuestionsAndAnswers:', message);
        setError(message);
        toast.error('Failed to load questionnaire');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionsAndAnswers();
  }, [user]);

  const setAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitAnswers = async (): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to submit answers');
      return false;
    }

    if (Object.keys(answers).length === 0) {
      toast.error('You need to answer at least one question');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log('Submitting answers for user:', user.id);
      const userAnswers: UserAnswer[] = Object.keys(answers).map(key => ({
        userId: user.id,
        questionId: parseInt(key),
        answer: answers[parseInt(key)]
      }));

      // Process each answer
      for (const answer of userAnswers) {
        console.log('Processing answer for question:', answer.questionId);
        
        // Check if answer exists already
        const { data: existingAnswer, error: checkError } = await supabase
          .from('user_answers')
          .select('id')
          .eq('user_id', answer.userId)
          .eq('question_id', answer.questionId)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error checking existing answer:', checkError);
          continue;
        }
        
        if (existingAnswer) {
          console.log('Updating existing answer for question:', answer.questionId);
          // Update existing answer
          const { error: updateError } = await supabase
            .from('user_answers')
            .update({ answer: answer.answer })
            .eq('id', existingAnswer.id);
          
          if (updateError) {
            console.error('Error updating answer:', updateError);
            throw new Error('Failed to update answer: ' + updateError.message);
          }
        } else {
          console.log('Inserting new answer for question:', answer.questionId);
          // Insert new answer
          const { error: insertError } = await supabase
            .from('user_answers')
            .insert({
              user_id: answer.userId,
              question_id: answer.questionId,
              answer: answer.answer
            });
          
          if (insertError) {
            console.error('Error inserting answer:', insertError);
            throw new Error('Failed to insert answer: ' + insertError.message);
          }
        }
      }
      
      setHasCompletedQuestionnaire(true);
      toast.success('Your answers have been saved');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit answers';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    questions,
    answers,
    isLoading,
    isSaving,
    error,
    hasCompletedQuestionnaire,
    setAnswer,
    submitAnswers
  };
};
