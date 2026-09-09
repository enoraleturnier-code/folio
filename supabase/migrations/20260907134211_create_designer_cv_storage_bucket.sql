-- Les 4 policies (insert/update/delete/select) posées dès cette migration
-- initiale -- ne PAS répéter le pattern en 2 temps qui a cassé la
-- suppression silencieuse sur project-thumbnails/designer-photos/
-- project-gallery (policy SELECT admin-only manquante initialement, cf.
-- CLAUDE.md et migrations 20260901183035_project_gallery_select_admin_for_mutations.sql
-- / 20260903184843_project_thumbnails_designer_photos_select_admin_for_mutations.sql) :
-- sans policy SELECT (même admin-only), l'API Storage ne peut pas retrouver
-- l'objet en interne avant un DELETE/UPDATE authentifié et échoue
-- silencieusement (error: null, data: []).
insert into storage.buckets (id, name, public)
values ('designer-cv', 'designer-cv', true)
on conflict (id) do nothing;

create policy "designer_cv_insert_admin"
on storage.objects for insert
to authenticated
with check (bucket_id = 'designer-cv' and get_my_role() = 'admin');

create policy "designer_cv_update_admin"
on storage.objects for update
to authenticated
using (bucket_id = 'designer-cv' and get_my_role() = 'admin')
with check (bucket_id = 'designer-cv' and get_my_role() = 'admin');

create policy "designer_cv_delete_admin"
on storage.objects for delete
to authenticated
using (bucket_id = 'designer-cv' and get_my_role() = 'admin');

create policy "designer_cv_select_admin"
on storage.objects for select
to authenticated
using (bucket_id = 'designer-cv' and get_my_role() = 'admin');
