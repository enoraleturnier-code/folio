-- Meme piege que 20260901183035_project_gallery_select_admin_for_mutations.sql,
-- confirme cette fois sur les deux buckets d'origine du pattern "bucket
-- public => aucune policy SELECT sur storage.objects"
-- (20260715082939_harden_public_bucket_storage_policies.sql) :
-- project-thumbnails et designer-photos avaient eu leur policy SELECT
-- anonyme retiree le 15/07 pour empecher le *listing* public, sans policy
-- admin-only de repli -- exactement le trou qui a ensuite ete comble sur
-- project-gallery le 01/09.
--
-- Repro confirme en direct (script Node, persona admin authentifie, cf.
-- historique de session) : `supabase.storage.from(bucket).remove([path])`
-- renvoyait `error: null` / `data: []` sans policy SELECT -- fichier
-- toujours accessible en HTTP 200 sur son URL publique apres coup. Avec
-- cette policy : `data` contient bien l'objet supprime, URL publique passe a
-- 400 (objet introuvable). Consequence en prod : `deleteProjectThumbnail()`
-- (appelee depuis `softDeleteProject`, src/data/projects.ts) echouait
-- silencieusement a nettoyer Storage depuis le 15/07 -- fichiers orphelins
-- possibles dans les deux buckets (verifie separement, cf. execute_sql).
--
-- Policy volontairement restreinte a `authenticated` + `get_my_role() =
-- 'admin'` (jamais `anon`), meme raisonnement que project-gallery : ne
-- reintroduit pas le probleme de listing public qui avait fait retirer la
-- policy SELECT anonyme en juillet.
create policy "project_thumbnails_select_admin"
on storage.objects for select
to authenticated
using (bucket_id = 'project-thumbnails' and get_my_role() = 'admin');

create policy "designer_photos_select_admin"
on storage.objects for select
to authenticated
using (bucket_id = 'designer-photos' and get_my_role() = 'admin');
