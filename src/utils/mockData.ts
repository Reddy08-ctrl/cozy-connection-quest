export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
}

export const questions: Question[] = [
  {
    id: '1',
    text: 'What are your top three hobbies?',
    type: 'text'
  },
  {
    id: '2',
    text: 'How do you prefer to spend your weekends?',
    type: 'multiple_choice',
    options: [
      'Outdoors and active',
      'Relaxing at home',
      'Social events with friends',
      'Trying new restaurants/bars',
      'Cultural activities (museums, concerts, etc.)'
    ]
  },
  {
    id: '3',
    text: 'What is your ideal vacation destination?',
    type: 'multiple_choice',
    options: [
      'Beach resort',
      'Mountain retreat',
      'City exploration',
      'Cultural immersion',
      'Adventure travel'
    ]
  },
  {
    id: '4',
    text: 'Describe your perfect date.',
    type: 'text'
  },
  {
    id: '5',
    text: 'What values are most important to you in a relationship?',
    type: 'multiple_choice',
    options: [
      'Trust and honesty',
      'Communication',
      'Shared interests',
      'Independence',
      'Growth and support'
    ]
  },
  {
    id: '6',
    text: 'How important is physical fitness to you?',
    type: 'multiple_choice',
    options: [
      'Very important - I work out daily',
      'Important - I try to stay active',
      'Somewhat important - I exercise occasionally',
      'Not very important - I rarely exercise',
      'Not important at all'
    ]
  },
  {
    id: '7',
    text: 'What are your long-term life goals?',
    type: 'text'
  }
];

export interface Match {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  avatar: string;
  compatibility: number;
  interests: string[];
}

export const matches: Match[] = [
  {
    id: '1',
    name: 'Emma',
    age: 28,
    location: 'San Francisco, CA',
    bio: 'Art director by day, amateur chef by night. Looking for someone to share good food and better conversations with.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    compatibility: 92,
    interests: ['Cooking', 'Art', 'Travel', 'Photography']
  },
  {
    id: '2',
    name: 'Michael',
    age: 31,
    location: 'Los Angeles, CA',
    bio: 'Software engineer who loves the outdoors. Hiking on weekends, coding on weekdays.',
    avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    compatibility: 87,
    interests: ['Hiking', 'Technology', 'Dogs', 'Craft Beer']
  },
  {
    id: '3',
    name: 'Sophia',
    age: 26,
    location: 'New York, NY',
    bio: 'Freelance writer and yoga enthusiast. Looking for meaningful connections in a busy world.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    compatibility: 81,
    interests: ['Yoga', 'Literature', 'Coffee', 'Meditation']
  },
  {
    id: '4',
    name: 'James',
    age: 30,
    location: 'Chicago, IL',
    bio: 'Music producer and vinyl collector. I speak fluent sarcasm and dad jokes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    compatibility: 78,
    interests: ['Music', 'Concerts', 'Record Collecting', 'Comedy']
  }
];

// List of possible interests for randomly generating user interests
const possibleInterests = [
  'Cooking', 'Art', 'Travel', 'Photography', 'Hiking', 'Technology', 
  'Dogs', 'Cats', 'Craft Beer', 'Yoga', 'Literature', 'Coffee', 
  'Meditation', 'Music', 'Concerts', 'Record Collecting', 'Comedy',
  'Movies', 'Gaming', 'Fitness', 'Running', 'Swimming', 'Dancing',
  'Theater', 'Writing', 'Painting', 'Volunteering', 'Gardening'
];

/**
 * Generates a random set of interests for a user
 * @param count Number of interests to generate (default: 3-5)
 * @returns Array of random interests
 */
export const generateRandomInterests = (count?: number): string[] => {
  // If count not provided, generate random number between 3-5
  const numInterests = count || Math.floor(Math.random() * 3) + 3;
  
  // Shuffle array and take the first numInterests elements
  return [...possibleInterests]
    .sort(() => 0.5 - Math.random())
    .slice(0, numInterests);
};
