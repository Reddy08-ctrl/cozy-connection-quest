
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: number;
  question: string;
  category: string;
}

export interface UserAnswer {
  userId: string;
  questionId: number;
  answer: string;
}

// Get all questions
export const getQuestions = async (): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error getting questions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting questions:', error);
    return [];
  }
};

// Get user answers
export const getUserAnswers = async (userId: string): Promise<UserAnswer[]> => {
  try {
    const { data, error } = await supabase
      .from('user_answers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting user answers:', error);
      return [];
    }
    
    return (data || []).map(item => ({
      userId: item.user_id,
      questionId: item.question_id,
      answer: item.answer
    }));
  } catch (error) {
    console.error('Error getting user answers:', error);
    return [];
  }
};

// Save user answers
export const saveUserAnswers = async (answers: UserAnswer[]): Promise<boolean> => {
  try {
    // Process each answer
    for (const answer of answers) {
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
        // Update existing answer
        const { error: updateError } = await supabase
          .from('user_answers')
          .update({ answer: answer.answer })
          .eq('id', existingAnswer.id);
        
        if (updateError) {
          console.error('Error updating answer:', updateError);
        }
      } else {
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
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving user answers:', error);
    return false;
  }
};
