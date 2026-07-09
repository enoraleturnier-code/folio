import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { AiStructuredDesc, Project, ProjectStatus, ProjectTags } from "@/types/project";

type ProjectCatalogRow = Tables<"projects_catalog_view">;
type ProjectRow = Tables<"projects">;

type ProjectRowWithTags = ProjectRow & {
  project_tools: { tools_ref: { name: string } | null }[] | null;
  project_keywords: { keywords_ref: { name: string } | null }[] | null;
  project_types: { project_types_ref: { name: string } | null }[] | null;
};

function mapJoinedTags(row: ProjectRowWithTags): ProjectTags {
  return {
    tools: (row.project_tools ?? [])
      .map((t) => t.tools_ref?.name)
      .filter((name): name is string => Boolean(name)),
    keywords: (row.project_keywords ?? [])
      .map((k) => k.keywords_ref?.name)
      .filter((name): name is string => Boolean(name)),
    types: (row.project_types ?? [])
      .map((t) => t.project_types_ref?.name)
      .filter((name): name is string => Boolean(name)),
  };
}

function mapCatalogRow(row: ProjectCatalogRow): Project {
  return {
    id: row.id!,
    title: row.title!,
    short_desc: row.short_desc,
    thumbnail_url: row.thumbnail_url,
    status: row.status!,
    sensitivity_level: row.sensitivity_level!,
    secteur_activite: row.secteur_activite,
    client_name: row.client_name,
    company_name: row.company_name,
    role: row.role,
    start_date: row.start_date,
    end_date: row.end_date,
    deleted_at: row.deleted_at,
    created_at: row.created_at!,
    updated_at: row.updated_at!,
    tags: {
      tools: row.tools ?? [],
      keywords: row.keywords ?? [],
      types: row.types ?? [],
    },
  };
}

function mapProjectRow(row: ProjectRowWithTags): Project {
  return {
    id: row.id,
    title: row.title,
    short_desc: row.short_desc,
    long_desc: row.long_desc,
    ai_structured_desc: (row.ai_structured_desc as AiStructuredDesc | null) ?? null,
    thumbnail_url: row.thumbnail_url,
    status: row.status,
    sensitivity_level: row.sensitivity_level,
    secteur_activite: row.secteur_activite,
    client_name: row.client_name,
    company_name: row.company_name,
    role: row.role,
    team: row.team,
    start_date: row.start_date,
    end_date: row.end_date,
    deleted_at: row.deleted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: mapJoinedTags(row),
  };
}

/**
 * Reads projects_catalog_view. Visibility (public vs confidential vs
 * draft, soft-deleted exclusion) is fully handled by the view's
 * underlying RLS depending on the caller's role — no client-side
 * filtering needed here.
 */
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects_catalog_view")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCatalogRow);
}

/**
 * Full project row for the detail page — includes long_desc,
 * ai_structured_desc, client_name, team (absent from the catalog view).
 *
 * By default excludes soft-deleted rows client-side even though RLS
 * already blocks non-admins from seeing them — defense in depth against
 * a visitor guessing/bookmarking a deleted project's UUID. Pass
 * `{ includeDeleted: true }` from admin-only call sites that need to
 * fetch a soft-deleted project (e.g. a future restore screen); RLS still
 * only lets that succeed for an authenticated admin.
 *
 * SECURITY: projects_select_unified now lets anon/pending see
 * confidential ROWS (teaser use case), but RLS can't restrict COLUMNS —
 * this raw `select *` would otherwise leak long_desc/ai_structured_desc/
 * client_name/team for a confidential project to a visitor who only has
 * teaser-level access. So for confidential rows we additionally check the
 * caller's role and return null unless they're validated_visitor/admin.
 * Public projects are unaffected — anyone can still see their full detail.
 *
 * Returns null if not found, soft-deleted (and includeDeleted wasn't
 * set), not visible under RLS, or confidential-but-caller-not-entitled.
 */
export async function getProjectById(
  id: string,
  opts: { includeDeleted?: boolean } = {},
): Promise<Project | null> {
  let query = supabase
    .from("projects")
    .select(
      `
      *,
      project_tools ( tools_ref ( name ) ),
      project_keywords ( keywords_ref ( name ) ),
      project_types ( project_types_ref ( name ) )
    `,
    )
    .eq("id", id);

  if (!opts.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query.maybeSingle<ProjectRowWithTags>();
  if (error) throw error;
  if (!data) return null;

  if (data.status === "confidential") {
    const { data: role, error: roleError } = await supabase.rpc("get_my_role");
    if (roleError) throw roleError;
    if (role !== "validated_visitor" && role !== "admin") {
      return null;
    }
  }

  return mapProjectRow(data);
}

/**
 * Admin-only writes. All three rely on the projects_update_admin RLS
 * policy (get_my_role() = 'admin') to actually take effect — Supabase
 * silently returns 0 affected rows rather than an error when RLS blocks
 * an update, so each function confirms the row came back via
 * .select().maybeSingle() and throws explicitly if it didn't.
 */

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<void> {
  const { data, error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      `updateProjectStatus: no row updated for id=${id} (not found, or not permitted)`,
    );
  }
}

export async function softDeleteProject(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(`softDeleteProject: no row updated for id=${id} (not found, or not permitted)`);
  }
}

export async function restoreProject(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("projects")
    .update({ deleted_at: null })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(`restoreProject: no row updated for id=${id} (not found, or not permitted)`);
  }
}
