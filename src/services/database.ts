
import { toast } from 'sonner';
import { dbConfig } from '@/config/database';

// Create a localStorage key for the database
const DB_KEY = 'cozy_connections_db';

// Define the database structure
interface LocalDatabase {
  users: any[];
  questions: any[];
  user_answers: any[];
  matches: any[];
  messages: any[];
  events: any[];
  event_invitations: any[];
}

// Empty database template
const emptyDatabase: LocalDatabase = {
  users: [],
  questions: [],
  user_answers: [],
  matches: [],
  messages: [],
  events: [],
  event_invitations: []
};

// Save database to localStorage
const saveDatabase = (db: LocalDatabase) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Get database from localStorage
const getDatabase = (): LocalDatabase => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    return dbString ? JSON.parse(dbString) : { ...emptyDatabase };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return { ...emptyDatabase };
  }
};

// Initialize the database
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing database...');
    
    // We'll use localStorage since MySQL cannot be used in browser
    console.log('Using localStorage for data storage');
    const db = getDatabase();
    
    // Initialize with default questions if they don't exist
    if (db.questions.length === 0) {
      db.questions = [
        { id: 1, question: 'What are your top three hobbies?', category: 'interests' },
        { id: 2, question: 'How do you prefer to spend your weekends?', category: 'lifestyle' },
        { id: 3, question: 'What is your ideal vacation destination?', category: 'travel' },
        { id: 4, question: 'Describe your perfect date.', category: 'relationships' },
        { id: 5, question: 'What values are most important to you in a relationship?', category: 'values' },
        { id: 6, question: 'Do you prefer outdoor or indoor activities?', category: 'lifestyle' },
        { id: 7, question: 'Are you a morning person or a night owl?', category: 'personality' },
        { id: 8, question: 'What type of books/movies/TV shows do you enjoy?', category: 'entertainment' },
        { id: 9, question: 'Do you have any pets or would you like to have pets?', category: 'lifestyle' },
        { id: 10, question: 'What are your career goals?', category: 'goals' }
      ];
    }
    
    saveDatabase(db);
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Failed to initialize database');
    return false;
  }
};

// Execute a query against the database
export const query = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    console.log('Query:', sql);
    console.log('Params:', params);
    
    return queryLocalStorage(sql, params);
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Query the localStorage database
const queryLocalStorage = (sql: string, params: any[] = []): any => {
  try {
    const db = getDatabase();
    
    // Parse the SQL query (very simplified)
    if (sql.includes('SELECT * FROM questions')) {
      return db.questions;
    }
    
    if (sql.includes('SELECT * FROM user_answers WHERE user_id = ?')) {
      return db.user_answers.filter(a => a.user_id === params[0]);
    }
    
    if (sql.includes('SELECT * FROM user_answers WHERE user_id = ? AND question_id = ?')) {
      return db.user_answers.filter(a => a.user_id === params[0] && a.question_id === params[1]);
    }
    
    if (sql.includes('UPDATE user_answers SET answer = ?')) {
      const userId = params[1];
      const questionId = params[2];
      const newAnswer = params[0];
      
      const index = db.user_answers.findIndex(
        a => a.user_id === userId && a.question_id === questionId
      );
      
      if (index !== -1) {
        db.user_answers[index].answer = newAnswer;
        saveDatabase(db);
      }
      
      return { affectedRows: 1 };
    }
    
    if (sql.includes('INSERT INTO user_answers')) {
      const newId = db.user_answers.length ? Math.max(...db.user_answers.map(a => a.id)) + 1 : 1;
      const newAnswer = {
        id: newId,
        user_id: params[0],
        question_id: params[1],
        answer: params[2],
        created_at: new Date().toISOString()
      };
      
      db.user_answers.push(newAnswer);
      saveDatabase(db);
      
      return { insertId: newId };
    }
    
    if (sql.includes('SELECT * FROM users WHERE email = ?')) {
      const users = db.users.filter(u => u.email === params[0]);
      return users;
    }
    
    if (sql.includes('INSERT INTO users')) {
      const newId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        email: params[0],
        password: params[1],
        name: params[2],
        created_at: new Date().toISOString()
      };
      
      db.users.push(newUser);
      saveDatabase(db);
      
      return { insertId: newId };
    }
    
    if (sql.includes('SELECT id, email, name FROM users WHERE id = ?')) {
      const user = db.users.find(u => u.id === params[0]);
      return user ? [user] : [];
    }
    
    if (sql.includes('SELECT * FROM users WHERE id = ?')) {
      const users = db.users.filter(u => u.id === params[0]);
      return users;
    }
    
    if (sql.includes('UPDATE users SET')) {
      const userId = params[6];
      const updatedUser = {
        name: params[0],
        avatar: params[1],
        bio: params[2],
        location: params[3],
        gender: params[4],
        date_of_birth: params[5]
      };
      
      const index = db.users.findIndex(u => u.id === userId);
      
      if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updatedUser };
        saveDatabase(db);
      }
      
      return { affectedRows: 1 };
    }
    
    // Handle match-related queries
    if (sql.includes('SELECT DISTINCT u.id, u.name, u.avatar, u.bio, u.location, u.date_of_birth, u.gender')) {
      // Return all users except the current user as potential matches
      return db.users.filter(u => u.id !== params[0]);
    }
    
    if (sql.includes('SELECT * FROM matches WHERE')) {
      const userId1 = params[0];
      const userId2 = params[1];
      const matchUserId1 = params[2];
      const matchUserId2 = params[3];
      
      return db.matches.filter(
        m => (m.user_id_1 === userId1 && m.user_id_2 === userId2) || 
             (m.user_id_1 === matchUserId1 && m.user_id_2 === matchUserId2)
      );
    }
    
    if (sql.includes('UPDATE matches SET match_score = ? WHERE id = ?')) {
      const matchId = params[1];
      const newScore = params[0];
      
      const index = db.matches.findIndex(m => m.id === matchId);
      
      if (index !== -1) {
        db.matches[index].match_score = newScore;
        saveDatabase(db);
      }
      
      return { affectedRows: 1 };
    }
    
    if (sql.includes('INSERT INTO matches')) {
      const newId = db.matches.length ? Math.max(...db.matches.map(m => m.id)) + 1 : 1;
      const newMatch = {
        id: newId,
        user_id_1: params[0],
        user_id_2: params[1],
        match_score: params[2],
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      db.matches.push(newMatch);
      saveDatabase(db);
      
      return { insertId: newId };
    }
    
    if (sql.includes('UPDATE matches SET status = ? WHERE id = ?')) {
      const matchId = params[1];
      const newStatus = params[0];
      
      const index = db.matches.findIndex(m => m.id === matchId);
      
      if (index !== -1) {
        db.matches[index].status = newStatus;
        saveDatabase(db);
      }
      
      return { affectedRows: 1 };
    }
    
    // Handle messages
    if (sql.includes('SELECT m.*, u1.name as sender_name, u1.avatar as sender_avatar FROM messages m')) {
      const userId = params[0];
      const otherUserId = params[1];
      
      const messages = db.messages.filter(
        m => (m.sender_id === userId && m.receiver_id === otherUserId) || 
             (m.sender_id === otherUserId && m.receiver_id === userId)
      ).map(m => {
        const sender = db.users.find(u => u.id === m.sender_id);
        return {
          ...m,
          sender_name: sender?.name,
          sender_avatar: sender?.avatar
        };
      });
      
      return messages;
    }
    
    if (sql.includes('UPDATE messages SET read = true')) {
      const otherUserId = params[0];
      const userId = params[1];
      
      db.messages.forEach((m, index) => {
        if (m.sender_id === otherUserId && m.receiver_id === userId && !m.read) {
          db.messages[index].read = true;
        }
      });
      
      saveDatabase(db);
      return { affectedRows: 1 };
    }
    
    if (sql.includes('INSERT INTO messages')) {
      const newId = db.messages.length ? Math.max(...db.messages.map(m => m.id)) + 1 : 1;
      const newMessage = {
        id: newId,
        sender_id: params[0],
        receiver_id: params[1],
        content: params[2],
        read: false,
        created_at: new Date().toISOString()
      };
      
      db.messages.push(newMessage);
      saveDatabase(db);
      
      const sender = db.users.find(u => u.id === newMessage.sender_id);
      
      return [{
        id: newId,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        content: newMessage.content,
        read: newMessage.read,
        created_at: newMessage.created_at,
        sender_name: sender?.name,
        sender_avatar: sender?.avatar
      }];
    }
    
    if (sql.includes('SELECT COUNT(*) as count FROM messages')) {
      const userId = params[0];
      const unreadCount = db.messages.filter(m => m.receiver_id === userId && !m.read).length;
      
      return [{ count: unreadCount }];
    }
    
    // Events
    if (sql.includes('INSERT INTO events')) {
      const newId = db.events.length ? Math.max(...db.events.map(e => e.id)) + 1 : 1;
      const newEvent = {
        id: newId,
        creator_id: params[0],
        title: params[1],
        description: params[2],
        location: params[3],
        event_date: params[4],
        created_at: new Date().toISOString()
      };
      
      db.events.push(newEvent);
      saveDatabase(db);
      
      const creator = db.users.find(u => u.id === newEvent.creator_id);
      
      return [{
        id: newId,
        ...newEvent,
        creator_name: creator?.name
      }];
    }
    
    // If no specific handler, return empty array
    console.warn('Unhandled query:', sql, params);
    return [];
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};
