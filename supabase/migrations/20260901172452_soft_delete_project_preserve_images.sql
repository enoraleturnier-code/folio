drop function public.soft_delete_project(uuid);

create function public.soft_delete_project(p_id uuid)
returns table(thumbnail_url text, image_storage_paths text[])
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_old_thumbnail text;
  v_image_paths text[];
  v_updated_id uuid;
begin
  select projects.thumbnail_url into v_old_thumbnail from projects where id = p_id;
  select array_agg(storage_path) into v_image_paths from project_images where project_id = p_id;

  delete from project_tools where project_id = p_id;
  delete from project_keywords where project_id = p_id;
  delete from project_types where project_id = p_id;
  -- project_images n'est PAS supprimee ici (contrairement aux tags) : seuls
  -- les fichiers Storage sont nettoyes cote client via image_storage_paths,
  -- les lignes restent en base sur demande explicite.

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

  return query select v_old_thumbnail, v_image_paths;
end;
$$;
