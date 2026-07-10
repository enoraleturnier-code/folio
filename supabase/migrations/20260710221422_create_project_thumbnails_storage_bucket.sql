-- Le commentaire de projects.thumbnail_url dit "URL image dans Supabase
-- Storage" mais aucun bucket n'existait réellement — les projets démo
-- utilisent tous des URLs externes Google non contrôlées par ce projet.
-- Crée le bucket public + policies RLS (lecture publique, écriture admin
-- uniquement, cohérent avec le reste des règles d'écriture de l'app).

insert into storage.buckets (id, name, public)
values ('project-thumbnails', 'project-thumbnails', true)
on conflict (id) do nothing;

create policy "project_thumbnails_select_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'project-thumbnails');

create policy "project_thumbnails_insert_admin"
on storage.objects for insert
to authenticated
with check (bucket_id = 'project-thumbnails' and get_my_role() = 'admin');

create policy "project_thumbnails_update_admin"
on storage.objects for update
to authenticated
using (bucket_id = 'project-thumbnails' and get_my_role() = 'admin')
with check (bucket_id = 'project-thumbnails' and get_my_role() = 'admin');

create policy "project_thumbnails_delete_admin"
on storage.objects for delete
to authenticated
using (bucket_id = 'project-thumbnails' and get_my_role() = 'admin');
