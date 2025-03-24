
import { useState, useEffect } from 'react';
import { getQuestions, saveUserAnswers, Question, UserAnswer } from '@/services/questionnaireService';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export const useQuestionnaire = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const fetchedQuestions = await getQuestions();
        setQuestions(fetchedQuestions);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch questions';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
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
      const userAnswers: UserAnswer[] = Object.keys(answers).map(key => ({
        userId: user.id,
        questionId: parseInt(key),
        answer: answers[parseInt(key)]
      }));

      const success = await saveUserAnswers(userAnswers);
      
      if (success) {
        toast.success('Your answers have been saved');
        return true;
      } else {
        throw new Error('Failed to save answers');
      }
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
    setAnswer,
    submitAnswers
  };
};
