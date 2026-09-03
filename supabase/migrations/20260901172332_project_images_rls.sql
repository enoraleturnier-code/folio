alter table public.project_images enable row level security;

create policy "project_images_select"
  on public.project_images for select
  to anon, authenticated
  using (
    get_my_role() = 'admin'
    or exists (
      select 1 from public.projects p
      where p.id = project_images.project_id
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

create policy "project_images_admin"
  on public.project_images for all
  to authenticated
  using (get_my_role() = 'admin')
  with check (get_my_role() = 'admin');
