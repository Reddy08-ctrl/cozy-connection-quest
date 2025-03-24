
import { createClient } from '@supabase/supabase-js';
import type { Tables } from './schema';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Tables['profiles'];
        Insert: Omit<Tables['profiles'], 'created_at'>;
        Update: Partial<Omit<Tables['profiles'], 'id' | 'created_at'>>;
      };
      questions: {
        Row: Tables['questions'];
        Insert: Omit<Tables['questions'], 'id'>;
        Update: Partial<Omit<Tables['questions'], 'id'>>;
      };
      user_answers: {
        Row: Tables['user_answers'];
        Insert: Omit<Tables['user_answers'], 'id' | 'created_at'>;
        Update: Partial<Omit<Tables['user_answers'], 'id' | 'created_at'>>;
      };
      matches: {
        Row: Tables['matches'];
        Insert: Omit<Tables['matches'], 'id' | 'created_at'>;
        Update: Partial<Omit<Tables['matches'], 'id' | 'created_at'>>;
      };
      messages: {
        Row: Tables['messages'];
        Insert: Omit<Tables['messages'], 'id' | 'created_at'>;
        Update: Partial<Omit<Tables['messages'], 'id' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

const SUPABASE_URL = "https://rrnujmpzaxrkzkhdhiof.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybnVqbXB6YXhya3praGRoaW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjMzMTksImV4cCI6MjA1MjQzOTMxOX0.CmlQVtDxRHqFhShdef-veFjMco1iqVzWgnguf5y66sQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
