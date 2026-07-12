-- Bug de securite (sans impact data verifie) : quand RLS bloque silencieusement
-- l'UPDATE (non-admin), Postgres n'affecte 0 ligne mais ne leve aucune erreur --
-- la fonction retournait quand meme 200 avec l'ancienne thumbnail_url (lue via
-- le SELECT initial, autorise par projects_select_unified pour un projet public),
-- laissant croire a un succes alors que rien n'a ete modifie. Verifie desormais
-- explicitement que l'UPDATE a affecte une ligne (meme pattern que
-- updateProjectStatus/softDeleteProject cote client : "confirme le retour
-- serveur, leve une erreur explicite sinon").
create or replace function public.soft_delete_project(p_id uuid)
returns table(thumbnail_url text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_old_thumbnail text;
  v_updated_id uuid;
begin
  select projects.thumbnail_url into v_old_thumbnail from projects where id = p_id;

  delete from project_tools where project_id = p_id;
  delete from project_keywords where project_id = p_id;
  delete from project_types where project_id = p_id;

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
  returning projects.id into v_updated_id;

  if v_updated_id is null then
    raise exception 'soft_delete_project: no row updated for id=% (not found, or not permitted)', p_id;
  end if;

  return query select v_old_thumbnail;
end;
$$;
