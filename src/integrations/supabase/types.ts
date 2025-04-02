export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event_invitations: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: number
          match_score: number
          status: string
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string
          id?: number
          match_score: number
          status?: string
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string
          id?: number
          match_score?: number
          status?: string
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          memory_branch_id: string
          memory_tree_id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          memory_branch_id: string
          memory_tree_id: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          memory_branch_id?: string
          memory_tree_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_memory_branch_id_fkey"
            columns: ["memory_branch_id"]
            isOneToOne: false
            referencedRelation: "memory_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_memory_tree_id_fkey"
            columns: ["memory_tree_id"]
            isOneToOne: false
            referencedRelation: "memory_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_branches: {
        Row: {
          created_at: string
          id: string
          memory_tree_id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          memory_tree_id: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          memory_tree_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_branches_memory_tree_id_fkey"
            columns: ["memory_tree_id"]
            isOneToOne: false
            referencedRelation: "memory_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_trees: {
        Row: {
          created_at: string
          id: string
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          gender: string | null
          id: string
          location: string | null
          name: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          gender?: string | null
          id: string
          location?: string | null
          name: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          gender?: string | null
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          id: number
          question: string
        }
        Insert: {
          category: string
          id?: number
          question: string
        }
        Update: {
          category?: string
          id?: number
          question?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          answer: string
          created_at: string
          id: number
          question_id: number
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: number
          question_id: number
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: number
          question_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
