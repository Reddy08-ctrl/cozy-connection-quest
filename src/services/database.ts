
import mysql from 'mysql2/promise';
import { toast } from 'sonner';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Vtu@20253',
  database: 'cozy_connections'
};

// Database connection pool
let pool: mysql.Pool | null = null;

// Initialize the database and create necessary tables
export const initializeDatabase = async () => {
  try {
    // Create a connection to MySQL server without database specified
    const initialConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Create database if it doesn't exist
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    
    // Close initial connection
    await initialConnection.end();
    
    // Create a connection pool with the database specified
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Create tables if they don't exist
    await createTables();
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Failed to connect to database');
    return false;
  }
};

// Create necessary tables
const createTables = async () => {
  if (!pool) throw new Error('Database not initialized');
  
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      avatar TEXT,
      bio TEXT,
      location VARCHAR(255),
      gender VARCHAR(50),
      date_of_birth DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Questions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      category VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // User answers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_answers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      question_id INT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);
  
  // Matches table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id_1 INT NOT NULL,
      user_id_2 INT NOT NULL,
      match_score FLOAT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Messages table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Events table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      creator_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      event_date DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Event invitations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_invitations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Insert default questions if they don't exist
  const [existingQuestions] = await pool.query('SELECT COUNT(*) as count FROM questions');
  
  if (existingQuestions[0].count === 0) {
    const defaultQuestions = [
      { question: 'What are your top three hobbies?', category: 'interests' },
      { question: 'How do you prefer to spend your weekends?', category: 'lifestyle' },
      { question: 'What is your ideal vacation destination?', category: 'travel' },
      { question: 'Describe your perfect date.', category: 'relationships' },
      { question: 'What values are most important to you in a relationship?', category: 'values' },
      { question: 'Do you prefer outdoor or indoor activities?', category: 'lifestyle' },
      { question: 'Are you a morning person or a night owl?', category: 'personality' },
      { question: 'What type of books/movies/TV shows do you enjoy?', category: 'entertainment' },
      { question: 'Do you have any pets or would you like to have pets?', category: 'lifestyle' },
      { question: 'What are your career goals?', category: 'goals' }
    ];
    
    for (const q of defaultQuestions) {
      await pool.query('INSERT INTO questions (question, category) VALUES (?, ?)', 
                      [q.question, q.category]);
    }
  }
};

// Get a database connection
export const getConnection = async () => {
  if (!pool) {
    await initializeDatabase();
  }
  return pool!;
};

// Execute a query
export const query = async (sql: string, params: any[] = []) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
