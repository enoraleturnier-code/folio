-- project_tools_select / project_keywords_select / project_types_select
-- ne vérifiaient que get_my_role() = 'validated_visitor' pour un projet
-- confidentiel, jamais l'accès individuellement approuvé (access_requests
-- .status = 'approved') — contrairement à projects_select_unified sur la
-- table projects elle-même. Un visiteur "pending" avec un accès approuvé
-- sur un projet précis (F-12) voyait donc ce projet dans le catalogue,
-- mais aucun de ses tags (tools/keywords/types) : la vue projects_catalog_view
-- passe par ces 3 tables de jonction, filtrées par leur propre RLS.

alter policy "project_tools_select" on public.project_tools using (
  get_my_role() = 'admin'
  or exists (
    select 1 from public.projects p
    where p.id = project_tools.project_id
      and p.deleted_at is null
      and (
        p.status = 'public'
        or (p.status in ('public','confidential') and get_my_role() = 'validated_visitor')
        or (
          p.status = 'confidential'
          and exists (
            select 1 from public.access_requests ar
            where ar.project_id = p.id and ar.user_id = auth.uid() and ar.status = 'approved'
          )
        )
      )
  )
);

alter policy "project_keywords_select" on public.project_keywords using (
  get_my_role() = 'admin'
  or exists (
    select 1 from public.projects p
    where p.id = project_keywords.project_id
      and p.deleted_at is null
      and (
        p.status = 'public'
        or (p.status in ('public','confidential') and get_my_role() = 'validated_visitor')
        or (
          p.status = 'confidential'
          and exists (
            select 1 from public.access_requests ar
            where ar.project_id = p.id and ar.user_id = auth.uid() and ar.status = 'approved'
          )
        )
      )
  )
);

alter policy "project_types_select" on public.project_types using (
  get_my_role() = 'admin'
  or exists (
    select 1 from public.projects p
    where p.id = project_types.project_id
      and p.deleted_at is null
      and (
        p.status = 'public'
        or (p.status in ('public','confidential') and get_my_role() = 'validated_visitor')
        or (
          p.status = 'confidential'
          and exists (
            select 1 from public.access_requests ar
            where ar.project_id = p.id and ar.user_id = auth.uid() and ar.status = 'approved'
          )
        )
      )
  )
);
