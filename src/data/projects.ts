import { getKeywordsRef, getToolsRef, getTypesRef } from "@/data/projectRefs";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { deleteProjectThumbnail } from "@/lib/storage";
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
 * Page profil : n'a besoin que de savoir s'il existe au moins un projet
 * confidentiel (pour afficher le bouton "Accéder aux projets confidentiels"),
 * jamais des cartes elles-mêmes -- `head: true` ne récupère aucune ligne,
 * juste un count via header HTTP, au lieu du `select *` complet de getProjects().
 */
export async function hasConfidentialProject(): Promise<boolean> {
  const { count, error } = await supabase
    .from("projects_catalog_view")
    .select("id", { count: "exact", head: true })
    .eq("status", "confidential");

  if (error) throw error;
  return (count ?? 0) > 0;
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
 * caller's role and return null unless they're validated_visitor/admin —
 * OR they hold an individually approved access_requests row for this
 * exact project (F-12 : une demande approuvée débloque ce projet précis
 * sans changer le rôle global de la personne, contrairement à
 * validated_visitor qui débloque tous les confidentiels).
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
      const { data: approvedRequest, error: requestError } = await supabase
        .from("access_requests")
        .select("id")
        .eq("project_id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (requestError) throw requestError;
      if (!approvedRequest) return null;
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

type ProjectScalarInput = Pick<
  Project,
  | "title"
  | "short_desc"
  | "long_desc"
  | "ai_structured_desc"
  | "thumbnail_url"
  | "status"
  | "sensitivity_level"
  | "secteur_activite"
  | "client_name"
  | "company_name"
  | "role"
  | "team"
  | "start_date"
  | "end_date"
>;

export type ProjectInput = ProjectScalarInput & { tags: ProjectTags };

function toScalarRow(input: ProjectScalarInput) {
  return {
    title: input.title,
    short_desc: input.short_desc,
    long_desc: input.long_desc,
    ai_structured_desc: input.ai_structured_desc as Json | null,
    thumbnail_url: input.thumbnail_url,
    status: input.status,
    sensitivity_level: input.sensitivity_level,
    secteur_activite: input.secteur_activite,
    client_name: input.client_name,
    company_name: input.company_name,
    role: input.role,
    team: input.team,
    start_date: input.start_date,
    end_date: input.end_date,
  };
}

/** Remplace entierement les tags d'un projet par delete-then-insert (volume trivial, quelques tags par projet). */
async function syncProjectTags(projectId: string, tags: ProjectTags): Promise<void> {
  const [tools, keywords, types] = await Promise.all([getToolsRef(), getKeywordsRef(), getTypesRef()]);

  const toolIds = tools.filter((t) => tags.tools.includes(t.name)).map((t) => t.id);
  const keywordIds = keywords.filter((k) => tags.keywords.includes(k.name)).map((k) => k.id);
  const typeIds = types.filter((t) => tags.types.includes(t.name)).map((t) => t.id);

  const deletions = await Promise.all([
    supabase.from("project_tools").delete().eq("project_id", projectId),
    supabase.from("project_keywords").delete().eq("project_id", projectId),
    supabase.from("project_types").delete().eq("project_id", projectId),
  ]);
  for (const { error } of deletions) if (error) throw error;

  const [toolsResult, keywordsResult, typesResult] = await Promise.all([
    toolIds.length
      ? supabase
          .from("project_tools")
          .insert(toolIds.map((tool_id) => ({ project_id: projectId, tool_id })))
          .select("tool_id")
      : Promise.resolve({ data: [] as unknown[], error: null }),
    keywordIds.length
      ? supabase
          .from("project_keywords")
          .insert(keywordIds.map((keyword_id) => ({ project_id: projectId, keyword_id })))
          .select("keyword_id")
      : Promise.resolve({ data: [] as unknown[], error: null }),
    typeIds.length
      ? supabase
          .from("project_types")
          .insert(typeIds.map((type_id) => ({ project_id: projectId, type_id })))
          .select("type_id")
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ]);

  // RLS peut filtrer silencieusement les lignes d'un insert multi-lignes sans lever
  // d'erreur (comme pour un UPDATE) -- on connait le nombre exact de lignes attendues
  // ici (toolIds/keywordIds/typeIds), donc un ecart signale un insert partiellement
  // bloque plutot qu'un faux succes silencieux.
  if (toolsResult.error) throw toolsResult.error;
  if ((toolsResult.data?.length ?? 0) !== toolIds.length) {
    throw new Error(
      `syncProjectTags: expected ${toolIds.length} project_tools row(s), got ${toolsResult.data?.length ?? 0} (project ${projectId})`,
    );
  }
  if (keywordsResult.error) throw keywordsResult.error;
  if ((keywordsResult.data?.length ?? 0) !== keywordIds.length) {
    throw new Error(
      `syncProjectTags: expected ${keywordIds.length} project_keywords row(s), got ${keywordsResult.data?.length ?? 0} (project ${projectId})`,
    );
  }
  if (typesResult.error) throw typesResult.error;
  if ((typesResult.data?.length ?? 0) !== typeIds.length) {
    throw new Error(
      `syncProjectTags: expected ${typeIds.length} project_types row(s), got ${typesResult.data?.length ?? 0} (project ${projectId})`,
    );
  }
}

/**
 * `id` est genere cote client (crypto.randomUUID()) et fourni explicitement
 * plutot que laisse au defaut `gen_random_uuid()` de la colonne : le drawer
 * en a besoin *avant* l'insert pour construire le chemin Storage de la
 * thumbnail (upload puis creation du projet, pas l'inverse).
 */
export async function createProject(id: string, input: ProjectInput): Promise<Project> {
  const { error } = await supabase
    .from("projects")
    .insert({ id, ...toScalarRow(input) });
  if (error) throw error;

  await syncProjectTags(id, input.tags);

  const full = await getProjectById(id, { includeDeleted: true });
  if (!full) throw new Error(`createProject: row not found immediately after insert (id=${id})`);
  return full;
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(toScalarRow(input))
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`updateProject: no row updated for id=${id} (not found, or not permitted)`);

  await syncProjectTags(id, input.tags);

  const full = await getProjectById(id, { includeDeleted: true });
  if (!full) throw new Error(`updateProject: row not found immediately after update (id=${id})`);
  return full;
}

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

/**
 * Soft delete reel (F-06) : vide tout le contenu du projet sauf `title`
 * (conserve pour l'etat "Projet supprime" sur une URL directe) et supprime
 * ses tags, via la fonction Postgres `soft_delete_project` (SECURITY INVOKER
 * -- la policy projects_update_admin s'applique normalement). Supprime
 * ensuite le fichier thumbnail du Storage si le projet en avait une --
 * best-effort : un echec de nettoyage Storage ne doit pas faire echouer la
 * suppression elle-meme, deja actee en base a ce stade.
 */
export async function softDeleteProject(id: string): Promise<void> {
  const { data, error } = await supabase.rpc("soft_delete_project", { p_id: id }).single();
  if (error) throw error;

  const oldThumbnailUrl = (data as { thumbnail_url: string | null } | null)?.thumbnail_url;
  if (oldThumbnailUrl) {
    try {
      await deleteProjectThumbnail(oldThumbnailUrl);
    } catch (err) {
      console.error("softDeleteProject: failed to clean up Storage thumbnail", err);
    }
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
