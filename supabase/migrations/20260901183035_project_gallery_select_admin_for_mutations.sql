-- Piege Supabase Storage decouvert en verifiant le flux de suppression d'une
-- image de galerie : le pattern "bucket public => aucune policy SELECT sur
-- storage.objects" (deja etabli pour project-thumbnails/designer-photos,
-- cf. 20260715082939_harden_public_bucket_storage_policies.sql) est correct
-- pour la LECTURE anonyme par URL directe (qui ne passe jamais par RLS), mais
-- casse silencieusement les operations authentifiees DELETE/UPDATE : l'API
-- Storage de Supabase a besoin de retrouver la ligne via une requete interne
-- soumise a RLS avant de la modifier/supprimer -- sans aucune policy SELECT
-- pour matcher, cette recherche echoue et l'API renvoie 403 "Access denied",
-- alors que la policy DELETE elle-meme (project_gallery_delete_admin) est
-- pourtant correcte et aurait autorise l'operation.
--
-- Repro confirme en direct (appel authentifie admin, DELETE sur un objet du
-- bucket project-gallery) : 403 sans cette policy, 200 "Successfully deleted"
-- avec. Cote client, deleteProjectGalleryImage() ne detectait pas l'echec
-- (aucune erreur renvoyee par l'API Storage dans ce cas -- comportement a
-- verifier plus largement, cf. note ajoutee dans storage.ts).
--
-- Policy volontairement restreinte a `authenticated` + `get_my_role() =
-- 'admin'` (jamais `anon`) : ne réintroduit pas le probleme de *listing*
-- public qui avait fait retirer la policy SELECT anonyme en juillet -- seul
-- un admin authentifie peut désormais lister/rechercher les objets de ce
-- bucket via RLS, ce qui est le prérequis pour que DELETE/UPDATE fonctionnent
-- pour lui.
create policy "project_gallery_select_admin"
on storage.objects for select
to authenticated
using (bucket_id = 'project-gallery' and get_my_role() = 'admin');
