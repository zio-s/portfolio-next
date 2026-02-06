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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_avatar: string | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string | null
          id: string
          likes: number | null
          parent_id: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          parent_id?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          parent_id?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          achievements: string[] | null
          category: string
          challenges: string[] | null
          content: string
          created_at: string | null
          demo_url: string | null
          description: string
          duration: string
          featured: boolean | null
          github_url: string | null
          id: string
          images: string[] | null
          likes: number | null
          role: string
          solutions: string[] | null
          sort_order: number | null
          start_date: string | null
          tags: string[] | null
          team_size: number
          tech_stack: string[] | null
          thumbnail: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          achievements?: string[] | null
          category: string
          challenges?: string[] | null
          content?: string
          created_at?: string | null
          demo_url?: string | null
          description: string
          duration: string
          featured?: boolean | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          likes?: number | null
          role: string
          solutions?: string[] | null
          sort_order?: number | null
          start_date?: string | null
          tags?: string[] | null
          team_size: number
          tech_stack?: string[] | null
          thumbnail: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          achievements?: string[] | null
          category?: string
          challenges?: string[] | null
          content?: string
          created_at?: string | null
          demo_url?: string | null
          description?: string
          duration?: string
          featured?: boolean | null
          github_url?: string | null
          id?: string
          images?: string[] | null
          likes?: number | null
          role?: string
          solutions?: string[] | null
          sort_order?: number | null
          start_date?: string | null
          tags?: string[] | null
          team_size?: number
          tech_stack?: string[] | null
          thumbnail?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      guestbook: {
        Row: {
          admin_reply: string | null
          admin_replied_at: string | null
          admin_user_id: string | null
          author_avatar: string | null
          author_avatar_url: string | null
          author_email: string | null
          author_name: string
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_pinned: boolean | null
          updated_at: string | null
          visitor_count: number | null
        }
        Insert: {
          admin_reply?: string | null
          admin_replied_at?: string | null
          admin_user_id?: string | null
          author_avatar?: string | null
          author_avatar_url?: string | null
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_pinned?: boolean | null
          updated_at?: string | null
          visitor_count?: number | null
        }
        Update: {
          admin_reply?: string | null
          admin_replied_at?: string | null
          admin_user_id?: string | null
          author_avatar?: string | null
          author_avatar_url?: string | null
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_pinned?: boolean | null
          updated_at?: string | null
          visitor_count?: number | null
        }
        Relationships: []
      }
      guestbook_visitors: {
        Row: {
          id: string
          visit_date: string
          visitor_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          visit_date: string
          visitor_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          visit_date?: string
          visitor_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_stats: {
        Row: {
          total_comments: number | null
          total_likes: number | null
          total_projects: number | null
          total_views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_comment_likes: {
        Args: { comment_uuid: string }
        Returns: undefined
      }
      decrement_comment_likes: {
        Args: { comment_uuid: string }
        Returns: undefined
      }
      increment_project_likes: {
        Args: { project_uuid: string }
        Returns: undefined
      }
      decrement_project_likes: {
        Args: { project_uuid: string }
        Returns: undefined
      }
      increment_project_views: {
        Args: { project_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
