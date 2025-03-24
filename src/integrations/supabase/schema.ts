
export type Tables = {
  profiles: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    location: string | null;
    gender: string | null;
    date_of_birth: string | null;
    created_at: string;
  };
  questions: {
    id: number;
    question: string;
    category: string;
  };
  user_answers: {
    id: number;
    user_id: string;
    question_id: number;
    answer: string;
    created_at: string;
  };
  matches: {
    id: number;
    user_id_1: string;
    user_id_2: string;
    match_score: number;
    status: string;
    created_at: string;
  };
  messages: {
    id: number;
    sender_id: string;
    receiver_id: string;
    content: string;
    read: boolean;
    created_at: string;
  };
};
