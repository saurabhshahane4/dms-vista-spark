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
      document_shares: {
        Row: {
          created_at: string
          document_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          permission_level: string
          share_token: string
          shared_by: string
          shared_with_email: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          permission_level: string
          share_token: string
          shared_by: string
          shared_with_email: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          permission_level?: string
          share_token?: string
          shared_by?: string
          shared_with_email?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          comment: string | null
          created_at: string
          document_id: string
          file_path: string
          file_size: number | null
          id: string
          is_current: boolean | null
          mime_type: string | null
          user_id: string
          version_number: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          document_id: string
          file_path: string
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          mime_type?: string | null
          user_id: string
          version_number?: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          document_id?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          mime_type?: string | null
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          content_extracted_at: string | null
          content_text: string | null
          created_at: string
          department: string | null
          embedding: string | null
          extraction_status: string | null
          file_path: string | null
          file_size: number | null
          folder_path: string | null
          id: string
          is_physical: boolean | null
          mime_type: string | null
          name: string
          physical_location_id: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content_extracted_at?: string | null
          content_text?: string | null
          created_at?: string
          department?: string | null
          embedding?: string | null
          extraction_status?: string | null
          file_path?: string | null
          file_size?: number | null
          folder_path?: string | null
          id?: string
          is_physical?: boolean | null
          mime_type?: string | null
          name: string
          physical_location_id?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content_extracted_at?: string | null
          content_text?: string | null
          created_at?: string
          department?: string | null
          embedding?: string | null
          extraction_status?: string | null
          file_path?: string | null
          file_size?: number | null
          folder_path?: string | null
          id?: string
          is_physical?: boolean | null
          mime_type?: string | null
          name?: string
          physical_location_id?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_physical_location_id_fkey"
            columns: ["physical_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          full_path: string
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_path: string
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_path?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_analytics: {
        Row: {
          created_at: string
          files_by_type: Json | null
          growth_rate_30d: number | null
          id: string
          last_calculated: string | null
          size_by_category: Json | null
          storage_efficiency: number | null
          total_files: number | null
          total_size_bytes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          files_by_type?: Json | null
          growth_rate_30d?: number | null
          id?: string
          last_calculated?: string | null
          size_by_category?: Json | null
          storage_efficiency?: number | null
          total_files?: number | null
          total_size_bytes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          files_by_type?: Json | null
          growth_rate_30d?: number | null
          id?: string
          last_calculated?: string | null
          size_by_category?: Json | null
          storage_efficiency?: number | null
          total_files?: number | null
          total_size_bytes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      storage_locations: {
        Row: {
          address: string | null
          capacity: number | null
          code: string
          created_at: string
          current_usage: number | null
          floor_level: string | null
          id: string
          location_type: string
          name: string
          notes: string | null
          section: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          code: string
          created_at?: string
          current_usage?: number | null
          floor_level?: string | null
          id?: string
          location_type: string
          name: string
          notes?: string | null
          section?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          code?: string
          created_at?: string
          current_usage?: number | null
          floor_level?: string | null
          id?: string
          location_type?: string
          name?: string
          notes?: string | null
          section?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      generate_share_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_document_with_version: {
        Args: { doc_id: string }
        Returns: {
          current_version: number
          file_path: string
          id: string
          name: string
          total_versions: number
          version_comment: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      hybrid_search_documents: {
        Args: {
          max_results?: number
          query_embedding: string
          search_query: string
          user_id_param: string
        }
        Returns: {
          content_text: string
          created_at: string
          file_path: string
          id: string
          name: string
          search_rank: number
          status: string
          tags: string[]
        }[]
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      search_documents_by_similarity: {
        Args: {
          max_results?: number
          query_embedding: string
          similarity_threshold?: number
          user_id_param: string
        }
        Returns: {
          content_text: string
          created_at: string
          file_path: string
          id: string
          name: string
          similarity: number
          status: string
          tags: string[]
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
