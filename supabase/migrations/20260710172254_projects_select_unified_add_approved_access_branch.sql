-- F-11 : une ligne access_requests.status = 'approved' débloque le projet
-- confidentiel précis pour ce visiteur, sans changer son rôle global
-- (validated_visitor reste seul à débloquer tous les confidentiels).
alter policy "projects_select_unified"
on public.projects
using (
  (get_my_role() = 'admin'::text)
  or (
    (deleted_at is null) and (
      (
        (status = 'public'::project_status)
        and (((select auth.uid()) is null) or (get_my_role() = any (array['pending'::text, 'rejected'::text])))
      )
      or (
        (status = any (array['public'::project_status, 'confidential'::project_status]))
        and (get_my_role() = 'validated_visitor'::text)
      )
      or (
        (status = 'confidential'::project_status)
        and (((select auth.uid()) is null) or (get_my_role() = 'pending'::text))
      )
      or (
        (status = 'confidential'::project_status)
        and (exists (
          select 1 from access_requests ar
          where ar.project_id = projects.id
            and ar.user_id = (select auth.uid())
            and ar.status = 'approved'::access_request_status
        ))
      )
    )
  )
);
