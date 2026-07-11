-- Bug : "returning projects.thumbnail_url" sur l'UPDATE qui met justement
-- thumbnail_url a null renvoyait la valeur APRES modification (donc toujours
-- null), jamais l'ancienne url -- le nettoyage Storage cote client ne se
-- declenchait donc jamais. Capture l'ancienne valeur AVANT l'update.
create or replace function public.soft_delete_project(p_id uuid)
returns table(thumbnail_url text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_old_thumbnail text;
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
  where id = p_id;

  return query select v_old_thumbnail;
end;
$$;
