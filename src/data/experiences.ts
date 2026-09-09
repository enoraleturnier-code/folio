import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type ExperienceRow = Tables<"experiences">;

export interface Experience {
  id: string;
  title: string;
  company: string;
  /** Description affichée dans l'en-tête de l'accordéon (fusion de l'ancien
   * couple short_desc/context). */
  shortDesc: string;
  bullets: string[];
  impact: string | null;
  projectId: string | null;
  startDate: string;
  endDate: string | null;
  displayOrder: number;
  deletedAt: string | null;
}

export interface ExperienceInput {
  title: string;
  company: string;
  shortDesc: string;
  bullets: string[];
  impact: string | null;
  projectId: string | null;
  startDate: string;
  endDate: string | null;
}

function mapExperienceRow(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    shortDesc: row.short_desc,
    bullets: row.bullets ?? [],
    impact: row.impact,
    projectId: row.project_id,
    startDate: row.start_date,
    endDate: row.end_date,
    displayOrder: row.display_order,
    deletedAt: row.deleted_at,
  };
}

function toRow(input: ExperienceInput) {
  return {
    title: input.title,
    company: input.company,
    short_desc: input.shortDesc,
    bullets: input.bullets,
    impact: input.impact,
    project_id: input.projectId,
    start_date: input.startDate,
    end_date: input.endDate,
  };
}

/** Lecture publique (ProfilePage). `.is("deleted_at", null)` explicite en
 * plus de la RLS -- même filet que `getProjects()`/`projects_catalog_view`. */
export async function getExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .is("deleted_at", null)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapExperienceRow);
}

/** Admin (ParametresTab) : toutes les lignes, y compris soft-supprimées --
 * la policy `experiences_admin` (FOR ALL) les rend visibles à un admin. */
export async function getExperiencesAdmin(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapExperienceRow);
}

async function getDesignerProfileId(): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("getDesignerProfileId: utilisateur non authentifié");

  const { data, error } = await supabase
    .from("designer_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("getDesignerProfileId: aucun designer_profiles pour cet utilisateur");
  return data.id;
}

export async function createExperience(
  input: ExperienceInput,
  displayOrder: number,
): Promise<Experience> {
  const designerProfileId = await getDesignerProfileId();
  const { data, error } = await supabase
    .from("experiences")
    .insert({
      designer_profile_id: designerProfileId,
      display_order: displayOrder,
      ...toRow(input),
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("createExperience: aucune ligne retournée après insert");
  return mapExperienceRow(data);
}

export async function updateExperience(id: string, input: ExperienceInput): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .update(toRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new Error(`updateExperience: no row updated for id=${id} (not found, or not permitted)`);
  return mapExperienceRow(data);
}

export async function updateExperienceOrder(id: string, displayOrder: number): Promise<void> {
  const { data, error } = await supabase
    .from("experiences")
    .update({ display_order: displayOrder })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      `updateExperienceOrder: no row updated for id=${id} (not found, or not permitted)`,
    );
  }
}

export async function softDeleteExperience(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("experiences")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      `softDeleteExperience: no row updated for id=${id} (not found, or not permitted)`,
    );
  }
}
