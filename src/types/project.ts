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

/** Réponse de l'Edge Function generate-ai-description : trio + short_desc + suggestions de tags. */
export interface AiGenerationResult {
  short_desc?: string;
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

/**
 * Taille dans la grille CSS de ProjectDetailPage (col-span/row-span,
 * `grid-flow-dense`) : small=1×1, wide=2×1, tall=1×2, large=2×2,
 * full=pleine largeur (col-span-full) ×1. Remplace l'ancien masonry
 * columns-* + width_variant (full/half/third), qui ne permettait pas de
 * vrais blocs de tailles différentes (28/09).
 */
export type SizeVariant = "small" | "wide" | "tall" | "large" | "full";

export interface ProjectImage {
  id: string;
  storage_path: string;
  /** Résolue via getPublicUrl au moment de la lecture — jamais stockée en base. */
  url: string;
  display_order: number;
  size_variant: SizeVariant;
  /** Légende affichée en overlay bas-droite sur ProjectDetailPage (toujours
   * visible si non vide, pas de hover) — pré-remplie à l'upload depuis le nom
   * de fichier (ProjectDrawer.tsx), éditable par l'admin. */
  caption: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  short_desc: string | null;
  /** Absent de projects_catalog_view — rempli uniquement par une requête sur la fiche détail. */
  long_desc?: string | null;
  /** Absent de projects_catalog_view — idem. Contrôle si `long_desc` est affiché sur
   * ProjectDetailPage plutôt que de rester un brouillon de travail admin-only. */
  show_long_desc?: boolean;
  /** Absent de projects_catalog_view — idem. */
  ai_structured_desc?: AiStructuredDesc | null;
  /** Absent de projects_catalog_view — idem, triées par display_order. */
  images?: ProjectImage[];
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
