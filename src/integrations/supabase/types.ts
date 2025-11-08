export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chatbot_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      course_poll_votes: {
        Row: {
          created_at: string | null
          id: string
          poll_id: string | null
          voter_city: string | null
          voter_email: string | null
          voter_identifier: string
          voter_job: string | null
          voter_name: string | null
          voter_phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          poll_id?: string | null
          voter_city?: string | null
          voter_email?: string | null
          voter_identifier: string
          voter_job?: string | null
          voter_name?: string | null
          voter_phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          poll_id?: string | null
          voter_city?: string | null
          voter_email?: string | null
          voter_identifier?: string
          voter_job?: string | null
          voter_name?: string | null
          voter_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "course_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      course_polls: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
          votes_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Relationships: []
      }
      course_suggestion_votes: {
        Row: {
          created_at: string | null
          id: string
          suggestion_id: string | null
          voter_identifier: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          suggestion_id?: string | null
          voter_identifier: string
        }
        Update: {
          created_at?: string | null
          id?: string
          suggestion_id?: string | null
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_suggestion_votes_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "course_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      course_suggestions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          suggested_by_email: string | null
          suggested_by_name: string | null
          title: string
          updated_at: string | null
          votes_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          suggested_by_email?: string | null
          suggested_by_name?: string | null
          title: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          suggested_by_email?: string | null
          suggested_by_name?: string | null
          title?: string
          updated_at?: string | null
          votes_count?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          additional_images: string[] | null
          certificate_url: string | null
          course_materials: Json | null
          course_topics: string[] | null
          course_type: string
          created_at: string
          description: string
          discounted_price: number | null
          duration: string
          end_date: string | null
          id: string
          image_url: string | null
          instructor: string
          instructor_credentials: string | null
          is_certificate_active: boolean | null
          is_ended: boolean | null
          is_free: boolean | null
          is_platform_active: boolean | null
          is_recorded_content_active: boolean | null
          is_registration_closed: boolean | null
          original_price: number | null
          platform_url: string | null
          rating: number
          recorded_content_type: string | null
          recorded_content_url: string | null
          recorded_content_urls: string[] | null
          registration_deadline: string | null
          registration_url: string | null
          start_date: string | null
          students: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          additional_images?: string[] | null
          certificate_url?: string | null
          course_materials?: Json | null
          course_topics?: string[] | null
          course_type?: string
          created_at?: string
          description: string
          discounted_price?: number | null
          duration: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          instructor: string
          instructor_credentials?: string | null
          is_certificate_active?: boolean | null
          is_ended?: boolean | null
          is_free?: boolean | null
          is_platform_active?: boolean | null
          is_recorded_content_active?: boolean | null
          is_registration_closed?: boolean | null
          original_price?: number | null
          platform_url?: string | null
          rating?: number
          recorded_content_type?: string | null
          recorded_content_url?: string | null
          recorded_content_urls?: string[] | null
          registration_deadline?: string | null
          registration_url?: string | null
          start_date?: string | null
          students?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          additional_images?: string[] | null
          certificate_url?: string | null
          course_materials?: Json | null
          course_topics?: string[] | null
          course_type?: string
          created_at?: string
          description?: string
          discounted_price?: number | null
          duration?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          instructor?: string
          instructor_credentials?: string | null
          is_certificate_active?: boolean | null
          is_ended?: boolean | null
          is_free?: boolean | null
          is_platform_active?: boolean | null
          is_recorded_content_active?: boolean | null
          is_registration_closed?: boolean | null
          original_price?: number | null
          platform_url?: string | null
          rating?: number
          recorded_content_type?: string | null
          recorded_content_url?: string | null
          recorded_content_urls?: string[] | null
          registration_deadline?: string | null
          registration_url?: string | null
          start_date?: string | null
          students?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      evaluation_forms: {
        Row: {
          course_id: string
          created_at: string
          form_questions: Json
          form_title: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          form_questions?: Json
          form_title?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          form_questions?: Json
          form_title?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_forms_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_responses: {
        Row: {
          course_id: string
          created_at: string
          form_id: string
          id: string
          responses: Json
          submitted_at: string
          trainee_email: string | null
          trainee_name: string
          trainee_phone: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          form_id: string
          id?: string
          responses?: Json
          submitted_at?: string
          trainee_email?: string | null
          trainee_name: string
          trainee_phone?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          form_id?: string
          id?: string
          responses?: Json
          submitted_at?: string
          trainee_email?: string | null
          trainee_name?: string
          trainee_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_responses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "evaluation_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          hero_image_url: string | null
          id: string
          logo_url: string | null
          show_hero_image: boolean | null
          site_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          logo_url?: string | null
          show_hero_image?: boolean | null
          site_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_image_url?: string | null
          id?: string
          logo_url?: string | null
          show_hero_image?: boolean | null
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_poll_votes: { Args: { poll_id: string }; Returns: undefined }
      increment_suggestion_votes: {
        Args: { suggestion_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      question_category: "course" | "trainer" | "center" | "venue" | "general"
      question_type: "rating" | "text" | "multiple_choice"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      question_category: ["course", "trainer", "center", "venue", "general"],
      question_type: ["rating", "text", "multiple_choice"],
    },
  },
} as const
