-- Les tags de projects_catalog_view étaient agrégés avec
-- array_agg(DISTINCT ...) sans ORDER BY explicite dans l'agrégat : l'ordre
-- de sortie n'est pas garanti déterministe par Postgres. Combiné au fait
-- que ProjectCard.tsx n'affichait qu'1 tag par catégorie, un tag pouvait
-- ne jamais apparaître sur la carte selon l'ordre de sortie du moment.
-- Fix : ORDER BY explicite dans chaque array_agg(DISTINCT ...) (même
-- colonne que le DISTINCT, seule syntaxe autorisée par Postgres ici).
CREATE OR REPLACE VIEW public.projects_catalog_view AS
SELECT
  p.id,
  p.title,
  p.short_desc,
  p.thumbnail_url,
  p.status,
  p.sensitivity_level,
  p.secteur_activite,
  p.company_name,
  p.role,
  CASE
    WHEN p.status = 'confidential'
      AND get_my_role() IS DISTINCT FROM 'validated_visitor'
      AND get_my_role() IS DISTINCT FROM 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM access_requests ar
        WHERE ar.project_id = p.id AND ar.user_id = auth.uid() AND ar.status = 'approved'
      )
    THEN NULL
    ELSE p.start_date
  END AS start_date,
  CASE
    WHEN p.status = 'confidential'
      AND get_my_role() IS DISTINCT FROM 'validated_visitor'
      AND get_my_role() IS DISTINCT FROM 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM access_requests ar
        WHERE ar.project_id = p.id AND ar.user_id = auth.uid() AND ar.status = 'approved'
      )
    THEN NULL
    ELSE p.end_date
  END AS end_date,
  p.deleted_at,
  p.created_at,
  p.updated_at,
  array_agg(DISTINCT tr.name ORDER BY tr.name) FILTER (WHERE tr.name IS NOT NULL) AS tools,
  array_agg(DISTINCT kr.name ORDER BY kr.name) FILTER (WHERE kr.name IS NOT NULL) AS keywords,
  array_agg(DISTINCT ptr.name ORDER BY ptr.name) FILTER (WHERE ptr.name IS NOT NULL) AS types,
  CASE
    WHEN p.status = 'confidential'
      AND get_my_role() IS DISTINCT FROM 'validated_visitor'
      AND get_my_role() IS DISTINCT FROM 'admin'
      AND NOT EXISTS (
        SELECT 1 FROM access_requests ar
        WHERE ar.project_id = p.id AND ar.user_id = auth.uid() AND ar.status = 'approved'
      )
    THEN NULL
    ELSE p.client_name
  END AS client_name
FROM projects p
  LEFT JOIN project_tools pt ON pt.project_id = p.id
  LEFT JOIN tools_ref tr ON tr.id = pt.tool_id
  LEFT JOIN project_keywords pk ON pk.project_id = p.id
  LEFT JOIN keywords_ref kr ON kr.id = pk.keyword_id
  LEFT JOIN project_types ptyp ON ptyp.project_id = p.id
  LEFT JOIN project_types_ref ptr ON ptr.id = ptyp.type_id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

-- CREATE OR REPLACE VIEW réinitialise silencieusement security_invoker :
-- toujours le repréciser après, sinon la vue repasse en SECURITY DEFINER
-- implicite et bypass la RLS des tables sous-jacentes (piège déjà vécu
-- sur cette même vue, cf. CLAUDE.md).
ALTER VIEW public.projects_catalog_view SET (security_invoker = true);
