-- Suite du fix précédent (fix_project_tags_visibility_for_approved_access) :
-- projects_select_unified autorise aussi la visibilité "teaser" d'un projet
-- confidentiel pour anon/pending (branche : status='confidential' AND
-- (auth.uid() IS NULL OR get_my_role() = 'pending')) — c'est ce qui permet
-- à un visiteur non-entitled de voir la carte (titre/description/tags) en
-- mode floute avant d'avoir demandé l'accès. Les 3 policies de jonction
-- n'avaient pas cette branche non plus (juste corrigées pour le cas "accès
-- approuvé" dans la migration précédente) : un visiteur pending sans accès
-- ne voyait donc aucun tag même sur un projet confidentiel pas encore
-- demandé, alors que la ligne projects elle-même s'affichait déjà en teaser.

alter policy "project_tools_select" on public.project_tools using (
  get_my_role() = 'admin'
  or exists (
    select 1 from public.projects p
    where p.id = project_tools.project_id
      and p.deleted_at is null
      and (
        p.status = 'public'
        or (p.status in ('public','confidential') and get_my_role() = 'validated_visitor')
        or (p.status = 'confidential' and ((select auth.uid()) is null or get_my_role() = 'pending'))
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
        or (p.status = 'confidential' and ((select auth.uid()) is null or get_my_role() = 'pending'))
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
        or (p.status = 'confidential' and ((select auth.uid()) is null or get_my_role() = 'pending'))
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
