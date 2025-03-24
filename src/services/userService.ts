
import { query } from './database';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  gender?: string;
  dateOfBirth?: Date;
  created_at?: Date;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  location: string;
  gender: string;
  dateOfBirth?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<User> => {
  try {
    const { email, password, name } = userData;
    
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert the new user
    const result = await query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );
    
    // Get the inserted user
    const id = result.insertId;
    const newUser = await query('SELECT id, email, name FROM users WHERE id = ?', [id]);
    
    if (Array.isArray(newUser) && newUser.length > 0) {
      return newUser[0] as User;
    }
    
    throw new Error('Failed to create user');
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const { email, password } = credentials;
    
    // Find the user
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: number, profileData: UserProfile): Promise<User> => {
  try {
    const { name, avatar, bio, location, gender, dateOfBirth } = profileData;
    
    // Update the user profile
    await query(
      `UPDATE users SET 
       name = ?, 
       avatar = ?, 
       bio = ?, 
       location = ?, 
       gender = ?, 
       date_of_birth = ?
       WHERE id = ?`,
      [name, avatar, bio, location, gender, dateOfBirth, userId]
    );
    
    // Get the updated user
    const updatedUser = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!Array.isArray(updatedUser) || updatedUser.length === 0) {
      throw new Error('User not found after update');
    }
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = updatedUser[0];
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: number): Promise<User> => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('User not found');
    }
    
    const user = users[0];
    
    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};
