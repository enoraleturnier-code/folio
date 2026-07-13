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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          consent_given_at: string
          created_at: string
          id: string
          message: string | null
          project_id: string
          rejected_at: string | null
          rejection_reason: string | null
          request_session_id: string
          status: Database["public"]["Enums"]["access_request_status"]
          user_id: string
          validated_at: string | null
        }
        Insert: {
          consent_given_at: string
          created_at?: string
          id?: string
          message?: string | null
          project_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_session_id: string
          status?: Database["public"]["Enums"]["access_request_status"]
          user_id: string
          validated_at?: string | null
        }
        Update: {
          consent_given_at?: string
          created_at?: string
          id?: string
          message?: string | null
          project_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_session_id?: string
          status?: Database["public"]["Enums"]["access_request_status"]
          user_id?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_catalog_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          cal_username: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cal_username?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cal_username?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          consent_given_at: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          status: Database["public"]["Enums"]["contact_status"]
          type: Database["public"]["Enums"]["contact_type"]
          user_id: string | null
        }
        Insert: {
          consent_given_at: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          status?: Database["public"]["Enums"]["contact_status"]
          type: Database["public"]["Enums"]["contact_type"]
          user_id?: string | null
        }
        Update: {
          consent_given_at?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          status?: Database["public"]["Enums"]["contact_status"]
          type?: Database["public"]["Enums"]["contact_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      design_watch_entries: {
        Row: {
          contenu: string | null
          created_at: string
          id: string
          nb_sources: number | null
          notion_page_id: string
          notion_url: string | null
          periode_debut: string | null
          periode_fin: string | null
          statut: string
          synced_at: string
          tags: string[]
          titre: string
        }
        Insert: {
          contenu?: string | null
          created_at?: string
          id?: string
          nb_sources?: number | null
          notion_page_id: string
          notion_url?: string | null
          periode_debut?: string | null
          periode_fin?: string | null
          statut: string
          synced_at?: string
          tags?: string[]
          titre: string
        }
        Update: {
          contenu?: string | null
          created_at?: string
          id?: string
          nb_sources?: number | null
          notion_page_id?: string
          notion_url?: string | null
          periode_debut?: string | null
          periode_fin?: string | null
          statut?: string
          synced_at?: string
          tags?: string[]
          titre?: string
        }
        Relationships: []
      }
      designer_profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          linkedin_url: string | null
          photo_url: string | null
          slug: string
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          photo_url?: string | null
          slug: string
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          photo_url?: string | null
          slug?: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords_ref: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      project_keywords: {
        Row: {
          keyword_id: string
          project_id: string
        }
        Insert: {
          keyword_id: string
          project_id: string
        }
        Update: {
          keyword_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_keywords_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords_ref"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_catalog_view"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tools: {
        Row: {
          project_id: string
          tool_id: string
        }
        Insert: {
          project_id: string
          tool_id: string
        }
        Update: {
          project_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tools_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tools_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_catalog_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools_ref"
            referencedColumns: ["id"]
          },
        ]
      }
      project_types: {
        Row: {
          project_id: string
          type_id: string
        }
        Insert: {
          project_id: string
          type_id: string
        }
        Update: {
          project_id?: string
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_types_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_types_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_catalog_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_types_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "project_types_ref"
            referencedColumns: ["id"]
          },
        ]
      }
      project_types_ref: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          ai_structured_desc: Json | null
          client_name: string | null
          company_name: string | null
          created_at: string
          deleted_at: string | null
          end_date: string | null
          id: string
          long_desc: string | null
          role: string | null
          secteur_activite:
            | Database["public"]["Enums"]["secteur_activite"]
            | null
          sensitivity_level: Database["public"]["Enums"]["sensitivity_level"]
          short_desc: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          team: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_structured_desc?: Json | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          long_desc?: string | null
          role?: string | null
          secteur_activite?:
            | Database["public"]["Enums"]["secteur_activite"]
            | null
          sensitivity_level?: Database["public"]["Enums"]["sensitivity_level"]
          short_desc?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_structured_desc?: Json | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          long_desc?: string | null
          role?: string | null
          secteur_activite?:
            | Database["public"]["Enums"]["secteur_activite"]
            | null
          sensitivity_level?: Database["public"]["Enums"]["sensitivity_level"]
          short_desc?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          team?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools_ref: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company: string | null
          consent_given_at: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          rejected_at: string | null
          rejection_reason: string | null
          request_message: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          validated_at: string | null
        }
        Insert: {
          company?: string | null
          consent_given_at?: string
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_message?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          validated_at?: string | null
        }
        Update: {
          company?: string | null
          consent_given_at?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          request_message?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          validated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      projects_catalog_view: {
        Row: {
          client_name: string | null
          company_name: string | null
          created_at: string | null
          deleted_at: string | null
          end_date: string | null
          id: string | null
          keywords: string[] | null
          role: string | null
          secteur_activite:
            | Database["public"]["Enums"]["secteur_activite"]
            | null
          sensitivity_level:
            | Database["public"]["Enums"]["sensitivity_level"]
            | null
          short_desc: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          thumbnail_url: string | null
          title: string | null
          tools: string[] | null
          types: string[] | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      has_other_approved_access_request: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      project_deletion_status: {
        Args: { p_id: string }
        Returns: {
          title: string
        }[]
      }
      project_is_sensible: { Args: { p_project_id: string }; Returns: boolean }
      soft_delete_project: {
        Args: { p_id: string }
        Returns: {
          thumbnail_url: string
        }[]
      }
    }
    Enums: {
      access_request_status: "pending" | "approved" | "rejected"
      contact_status: "new" | "treated" | "archived"
      contact_type: "contact" | "rdv"
      project_status: "draft" | "public" | "confidential"
      secteur_activite:
        | "tech_saas"
        | "ecommerce"
        | "finance_banque_assurance"
        | "sante"
        | "education"
        | "media_culture"
        | "industrie_manufacturing"
        | "retail_distribution"
        | "immobilier"
        | "rh_recrutement"
        | "transport_logistique"
        | "tourisme_hotellerie"
        | "alimentation_restauration"
        | "energie_environnement"
        | "sport_bien_etre"
        | "luxe_mode"
        | "juridique_conseil"
        | "association_ngo"
        | "entreprise_publique"
        | "startup"
        | "autre"
      sensitivity_level: "sensible" | "tres_sensible"
      user_role: "pending" | "validated_visitor" | "admin" | "rejected"
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
      access_request_status: ["pending", "approved", "rejected"],
      contact_status: ["new", "treated", "archived"],
      contact_type: ["contact", "rdv"],
      project_status: ["draft", "public", "confidential"],
      secteur_activite: [
        "tech_saas",
        "ecommerce",
        "finance_banque_assurance",
        "sante",
        "education",
        "media_culture",
        "industrie_manufacturing",
        "retail_distribution",
        "immobilier",
        "rh_recrutement",
        "transport_logistique",
        "tourisme_hotellerie",
        "alimentation_restauration",
        "energie_environnement",
        "sport_bien_etre",
        "luxe_mode",
        "juridique_conseil",
        "association_ngo",
        "entreprise_publique",
        "startup",
        "autre",
      ],
      sensitivity_level: ["sensible", "tres_sensible"],
      user_role: ["pending", "validated_visitor", "admin", "rejected"],
    },
  },
} as const
