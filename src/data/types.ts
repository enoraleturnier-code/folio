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

/** Full row, used for the admin dashboard and the project detail page. */
export interface Project {
  id: string;
  title: string;
  shortDesc: string | null;
  longDesc: string | null;
  aiStructuredDesc: AiStructuredDesc | null;
  thumbnailUrl: string | null;
  status: ProjectStatus;
  sensitivityLevel: SensitivityLevel;
  secteurActivite: SecteurActivite | null;
  clientName: string | null;
  companyName: string | null;
  role: string | null;
  team: string | null;
  startDate: string | null;
  endDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ProjectTags;
}

/** Lighter row from projects_catalog_view, used for the public catalogue listing. */
export interface ProjectSummary {
  id: string;
  title: string;
  shortDesc: string | null;
  thumbnailUrl: string | null;
  status: ProjectStatus;
  sensitivityLevel: SensitivityLevel;
  secteurActivite: SecteurActivite | null;
  companyName: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  tags: ProjectTags;
}

export interface Designer {
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profession: string;
  /** Adjectif mis en avant dans le titre du profil public (accent italique). */
  adjective: string;
  headline: string;
  bio: string;
  avatar: string;
  linkedin: string;
  twitter: string;
  website: string;
  calUsername: string;
  email: string;
  location: string;
}
