insert into storage.buckets (id, name, public)
values ('project-gallery', 'project-gallery', true)
on conflict (id) do nothing;

create policy "project_gallery_insert_admin"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-gallery' and get_my_role() = 'admin');

create policy "project_gallery_update_admin"
on storage.objects for update
to authenticated
using (bucket_id = 'project-gallery' and get_my_role() = 'admin')
with check (bucket_id = 'project-gallery' and get_my_role() = 'admin');

create policy "project_gallery_delete_admin"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-gallery' and get_my_role() = 'admin');
