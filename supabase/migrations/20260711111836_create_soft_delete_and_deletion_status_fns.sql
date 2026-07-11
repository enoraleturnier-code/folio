-- Soft delete reel : vide le contenu (tout sauf title, conformement aux
-- commentaires de colonnes deja presents sur la table), retourne l'ancienne
-- thumbnail_url pour que l'appelant supprime le fichier physique cote client
-- (Postgres ne peut pas appeler l'API Storage). SECURITY INVOKER : s'execute
-- sous les droits de l'appelant, la policy projects_update_admin s'applique
-- normalement (pas de bypass RLS ici, contrairement a get_my_role() etc.)
create or replace function public.soft_delete_project(p_id uuid)
returns table(thumbnail_url text)
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from project_tools where project_id = p_id;
  delete from project_keywords where project_id = p_id;
  delete from project_types where project_id = p_id;

  return query
  update projects set
    deleted_at = now(),
    short_desc = null,
    long_desc = null,
    ai_structured_desc = null,
    thumbnail_url = null,
    secteur_activite = null,
    client_name = null,
    company_name = null,
    role = null,
    team = null,
    start_date = null,
    end_date = null
  where id = p_id
  returning projects.thumbnail_url;
end;
$$;

comment on function public.soft_delete_project(uuid) is 'Soft delete reel (F-06) : vide tout le contenu sauf title (conserve pour l''etat "Projet supprime"), supprime les tags lies. Retourne l''ancienne thumbnail_url avant clear pour que l''appelant supprime le fichier Storage.';

-- Permet a un visiteur non-admin de savoir qu'un projet a ete supprime
-- (vs jamais existe) sans lui donner acces au contenu -- projects_select_unified
-- exclut totalement deleted_at IS NOT NULL pour les non-admins, donc impossible
-- de distinguer les deux cas sans ce bypass controle. Ne renvoie une ligne QUE
-- si le projet est reellement soft-deleted (jamais pour un brouillon ou un id
-- inexistant) -- ne fuite rien de plus que ce que le schema documente deja
-- comme volontairement conserve (title).
create or replace function public.project_deletion_status(p_id uuid)
returns table(title text)
language sql
security definer
set search_path = public
as $$
  select projects.title from projects where id = p_id and deleted_at is not null;
$$;

comment on function public.project_deletion_status(uuid) is 'Bypass RLS controle : indique si un id de projet correspond a un projet soft-deleted (et son titre conserve), pour afficher "Projet supprime" au lieu d''une 404 generique sur la fiche detail.';
