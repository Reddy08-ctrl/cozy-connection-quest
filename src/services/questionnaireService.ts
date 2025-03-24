
import { query } from './database';

export interface Question {
  id: number;
  question: string;
  category: string;
}

export interface UserAnswer {
  userId: number;
  questionId: number;
  answer: string;
}

// Get all questions
export const getQuestions = async (): Promise<Question[]> => {
  try {
    const questions = await query('SELECT * FROM questions');
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error('Error getting questions:', error);
    return [];
  }
};

// Save user answers
export const saveUserAnswers = async (answers: UserAnswer[]): Promise<boolean> => {
  try {
    for (const answer of answers) {
      const { userId, questionId, answer: answerText } = answer;
      
      // Check if an answer already exists for this user and question
      const existingAnswers = await query(
        'SELECT * FROM user_answers WHERE user_id = ? AND question_id = ?',
        [userId, questionId]
      );
      
      if (Array.isArray(existingAnswers) && existingAnswers.length > 0) {
        // Update existing answer
        await query(
          'UPDATE user_answers SET answer = ? WHERE user_id = ? AND question_id = ?',
          [answerText, userId, questionId]
        );
      } else {
        // Insert new answer
        await query(
          'INSERT INTO user_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
          [userId, questionId, answerText]
        );
      }
    }
    return true;
  } catch (error) {
    console.error('Error saving user answers:', error);
    return false;
  }
};

// Get user answers
export const getUserAnswers = async (userId: number): Promise<any[]> => {
  try {
    const answers = await query(
      `SELECT ua.*, q.question, q.category 
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.user_id = ?`,
      [userId]
    );
    
    return Array.isArray(answers) ? answers : [];
  } catch (error) {
    console.error('Error getting user answers:', error);
    return [];
  }
};
