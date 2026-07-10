import type { Enums } from "@/integrations/supabase/types";

export type ProjectStatus = Enums<"project_status">; // "draft" | "public" | "confidential"
export type SensitivityLevel = Enums<"sensitivity_level">; // "sensible" | "tres_sensible"
export type SecteurActivite = Enums<"secteur_activite">;

export interface AiStructuredDesc {
  probleme?: string;
  decisions?: string;
  resultat?: string;
  tools_suggestions?: string[];
  keywords_suggestions?: string[];
  types_suggestions?: string[];
}

export interface ProjectTags {
  tools: string[];
  keywords: string[];
  types: string[];
}

export interface Project {
  id: string;
  title: string;
  short_desc: string | null;
  /** Absent de projects_catalog_view — rempli uniquement par une requête sur la fiche détail. */
  long_desc?: string | null;
  /** Absent de projects_catalog_view — idem. */
  ai_structured_desc?: AiStructuredDesc | null;
  thumbnail_url: string | null;
  status: ProjectStatus;
  sensitivity_level: SensitivityLevel;
  secteur_activite: SecteurActivite | null;
  client_name: string | null;
  company_name: string | null;
  role: string | null;
  /** Absent de projects_catalog_view — idem. */
  team?: string | null;
  start_date: string | null;
  end_date: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  tags: ProjectTags;
}
