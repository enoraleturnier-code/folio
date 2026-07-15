-- project-thumbnails et designer-photos sont des buckets `public: true` : la
-- lecture d'un objet par URL directe (/storage/v1/object/public/...) ne passe
-- pas par RLS. Leur policy SELECT sur storage.objects ne sert donc qu'a
-- autoriser le *listing* de tous les fichiers du bucket, jamais necessaire
-- pour l'usage reel de l'app -- on la retire des deux (advisor Supabase
-- "Public Bucket Allows Listing").
drop policy if exists "project_thumbnails_select_public" on storage.objects;
drop policy if exists "designer_photos_select_public" on storage.objects;

-- designer-photos n'avait jamais ete versionne dans une migration locale : le
-- bucket + ses policies insert/update/delete admin ont ete appliques
-- directement en remote (commit 3b90b2d), jamais commit dans supabase/migrations.
-- On backfill l'etat actuel ici (moins la SELECT policy retiree ci-dessus) pour
-- qu'un rebuild du projet depuis les migrations ne perde pas ce bucket.
-- `to authenticated` (et non `to public`) pour matcher le pattern de
-- project-thumbnails et ce que documente DESIGN.md ("meme pattern RLS").
insert into storage.buckets (id, name, public)
values ('designer-photos', 'designer-photos', true)
on conflict (id) do nothing;

drop policy if exists "designer_photos_insert_admin" on storage.objects;
create policy "designer_photos_insert_admin"
on storage.objects for insert
to authenticated
with check (bucket_id = 'designer-photos' and get_my_role() = 'admin');

drop policy if exists "designer_photos_update_admin" on storage.objects;
create policy "designer_photos_update_admin"
on storage.objects for update
to authenticated
using (bucket_id = 'designer-photos' and get_my_role() = 'admin')
with check (bucket_id = 'designer-photos' and get_my_role() = 'admin');

drop policy if exists "designer_photos_delete_admin" on storage.objects;
create policy "designer_photos_delete_admin"
on storage.objects for delete
to authenticated
using (bucket_id = 'designer-photos' and get_my_role() = 'admin');
