-- Durcit access_requests_insert_pending : jusqu'ici la policy ne
-- restreignait pas la colonne status à l'insert, un visiteur pending
-- pouvait donc insérer directement une ligne status='approved'.
--
-- Le check autorise désormais deux cas :
--   1. status = 'pending' (cas normal)
--   2. status = 'approved' uniquement pour l'auto-approbation F-11 :
--      le projet visé est "sensible" ET le visiteur a déjà une autre
--      ligne approuvée sur un projet différent.
--
-- Piège évité : projects_select_unified interroge access_requests, et
-- cette policy interroge projects (sensitivity_level) — deux sous-requêtes
-- brutes inter-tables créent une récursion RLS croisée (42P17 infinite
-- recursion detected in policy). Les deux checks passent donc par des
-- fonctions SECURITY DEFINER qui bypassent RLS, comme get_my_role() le
-- fait déjà pour user_profiles.

create or replace function public.has_other_approved_access_request(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.access_requests ar2
    where ar2.user_id = auth.uid()
      and ar2.status = 'approved'::access_request_status
      and ar2.project_id <> p_project_id
  );
$$;

create or replace function public.project_is_sensible(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.projects pr
    where pr.id = p_project_id
      and pr.sensitivity_level = 'sensible'::sensitivity_level
  );
$$;

alter policy "access_requests_insert_pending"
on public.access_requests
with check (
  (user_id = (select auth.uid()))
  and (get_my_role() = 'pending'::text)
  and (
    (status = 'pending'::access_request_status)
    or (
      (status = 'approved'::access_request_status)
      and (validated_at is not null)
      and (project_is_sensible(access_requests.project_id))
      and (has_other_approved_access_request(access_requests.project_id))
    )
  )
);
