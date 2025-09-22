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
      approval_matrix: {
        Row: {
          approvers: Json
          conditions: Json
          created_at: string
          escalation_policy: Json | null
          id: string
          is_active: boolean | null
          name: string
          priority_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approvers?: Json
          conditions?: Json
          created_at?: string
          escalation_policy?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          priority_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approvers?: Json
          conditions?: Json
          created_at?: string
          escalation_policy?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          approval_level: number
          approved_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          document_id: string | null
          due_date: string | null
          id: string
          priority: string | null
          rejected_at: string | null
          status: string
          updated_at: string
          user_id: string
          workflow_instance_id: string
        }
        Insert: {
          approval_level?: number
          approved_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          rejected_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_instance_id: string
        }
        Update: {
          approval_level?: number
          approved_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          rejected_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_instance_id?: string
        }
        Relationships: []
      }
      assignment_rules: {
        Row: {
          capacity_threshold: number | null
          created_at: string
          customer_pattern: string | null
          document_type_conditions: string[] | null
          fallback_rack_patterns: string[] | null
          file_size_max: number | null
          file_size_min: number | null
          id: string
          is_active: boolean | null
          order_by: string | null
          preferred_rack_patterns: string[] | null
          priority_level: string | null
          rule_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity_threshold?: number | null
          created_at?: string
          customer_pattern?: string | null
          document_type_conditions?: string[] | null
          fallback_rack_patterns?: string[] | null
          file_size_max?: number | null
          file_size_min?: number | null
          id?: string
          is_active?: boolean | null
          order_by?: string | null
          preferred_rack_patterns?: string[] | null
          priority_level?: string | null
          rule_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity_threshold?: number | null
          created_at?: string
          customer_pattern?: string | null
          document_type_conditions?: string[] | null
          fallback_rack_patterns?: string[] | null
          file_size_max?: number | null
          file_size_min?: number | null
          id?: string
          is_active?: boolean | null
          order_by?: string | null
          preferred_rack_patterns?: string[] | null
          priority_level?: string | null
          rule_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_rack_assignments: {
        Row: {
          assigned_date: string
          assignment_type: string | null
          capacity_threshold: number | null
          created_at: string
          customer_id: string
          document_types: string[] | null
          id: string
          is_active: boolean | null
          notes: string | null
          priority_order: number | null
          rack_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_date?: string
          assignment_type?: string | null
          capacity_threshold?: number | null
          created_at?: string
          customer_id: string
          document_types?: string[] | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          priority_order?: number | null
          rack_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_date?: string
          assignment_type?: string | null
          capacity_threshold?: number | null
          created_at?: string
          customer_id?: string
          document_types?: string[] | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          priority_order?: number | null
          rack_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          auto_assignment_enabled: boolean | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          customer_code: string
          document_types: string[] | null
          id: string
          name: string
          priority_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          auto_assignment_enabled?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_code: string
          document_types?: string[] | null
          id?: string
          name: string
          priority_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          auto_assignment_enabled?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          customer_code?: string
          document_types?: string[] | null
          id?: string
          name?: string
          priority_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_locations: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          document_id: string
          id: string
          notes: string | null
          rack_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          document_id: string
          id?: string
          notes?: string | null
          rack_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          document_id?: string
          id?: string
          notes?: string | null
          rack_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_locations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_locations_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "racks"
            referencedColumns: ["id"]
          },
        ]
      }
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
      document_workflow_triggers: {
        Row: {
          conditions: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          trigger_event: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          trigger_event: string
          user_id: string
          workflow_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          trigger_event?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_workflow_triggers_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
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
      location_history: {
        Row: {
          document_id: string
          from_rack_id: string | null
          id: string
          moved_at: string | null
          moved_by: string | null
          notes: string | null
          reason: string | null
          to_rack_id: string | null
          user_id: string
        }
        Insert: {
          document_id: string
          from_rack_id?: string | null
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          notes?: string | null
          reason?: string | null
          to_rack_id?: string | null
          user_id: string
        }
        Update: {
          document_id?: string
          from_rack_id?: string | null
          id?: string
          moved_at?: string | null
          moved_by?: string | null
          notes?: string | null
          reason?: string | null
          to_rack_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_history_from_rack_id_fkey"
            columns: ["from_rack_id"]
            isOneToOne: false
            referencedRelation: "racks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_history_to_rack_id_fkey"
            columns: ["to_rack_id"]
            isOneToOne: false
            referencedRelation: "racks"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          options: Json | null
          related_document_type: string | null
          required: boolean
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          options?: Json | null
          related_document_type?: string | null
          required?: boolean
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          options?: Json | null
          related_document_type?: string | null
          required?: boolean
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
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
      racks: {
        Row: {
          barcode: string | null
          capacity: number | null
          code: string
          created_at: string | null
          current_count: number | null
          id: string
          is_active: boolean | null
          name: string
          position_x: number | null
          position_y: number | null
          shelf_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          capacity?: number | null
          code: string
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          position_x?: number | null
          position_y?: number | null
          shelf_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          capacity?: number | null
          code?: string
          created_at?: string | null
          current_count?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          position_x?: number | null
          position_y?: number | null
          shelf_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "racks_shelf_id_fkey"
            columns: ["shelf_id"]
            isOneToOne: false
            referencedRelation: "shelves"
            referencedColumns: ["id"]
          },
        ]
      }
      routing_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          priority_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          priority_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          priority_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shelves: {
        Row: {
          code: string
          created_at: string | null
          depth_cm: number | null
          height_cm: number | null
          id: string
          is_active: boolean | null
          max_weight_kg: number | null
          name: string
          updated_at: string | null
          user_id: string
          width_cm: number | null
          zone_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          depth_cm?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          max_weight_kg?: number | null
          name: string
          updated_at?: string | null
          user_id: string
          width_cm?: number | null
          zone_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          depth_cm?: number | null
          height_cm?: number | null
          id?: string
          is_active?: boolean | null
          max_weight_kg?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
          width_cm?: number | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shelves_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          manager_name: string | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_audit_log: {
        Row: {
          action: string
          details: Json | null
          id: string
          timestamp: string
          user_id: string
          workflow_instance_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id: string
          workflow_instance_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          timestamp?: string
          user_id?: string
          workflow_instance_id?: string | null
        }
        Relationships: []
      }
      workflow_instances: {
        Row: {
          completed_at: string | null
          context_data: Json | null
          created_at: string
          current_step: string | null
          document_id: string | null
          id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string
          current_step?: string | null
          document_id?: string | null
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          context_data?: Json | null
          created_at?: string
          current_step?: string | null
          document_id?: string | null
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string
          definition: Json
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          status: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          definition?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          definition?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      zones: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          temperature_controlled: boolean | null
          updated_at: string | null
          user_id: string
          warehouse_id: string
          zone_type: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          temperature_controlled?: boolean | null
          updated_at?: string | null
          user_id: string
          warehouse_id: string
          zone_type?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          temperature_controlled?: boolean | null
          updated_at?: string | null
          user_id?: string
          warehouse_id?: string
          zone_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
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
      send_notification: {
        Args: {
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type?: string
          recipient_user_id: string
        }
        Returns: string
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
      app_role: "admin" | "manager" | "user" | "viewer"
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
      app_role: ["admin", "manager", "user", "viewer"],
    },
  },
} as const
