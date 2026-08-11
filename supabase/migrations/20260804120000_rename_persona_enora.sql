-- Rename demo persona "Léa Martin" -> "Enora Le Turnier" (chore/rename-persona-enora).
-- Two independent UPDATEs, each checked via GET DIAGNOSTICS to fail loudly if the
-- expected single row isn't touched -- cf. CLAUDE.md: never assume an UPDATE
-- succeeded just because it didn't raise an error, RLS/a bad WHERE can silently
-- affect 0 rows.
--
-- MUST be applied in the same deploy window as the code change to
-- src/data/designer.ts (designer.slug): getDesignerProfile() reads
-- designer_profiles by .eq("slug", designer.slug) -- if the code ships with the
-- new slug while this migration hasn't run yet (or vice versa), the query
-- matches 0 rows and silently falls back to the hardcoded mock bio/photo/links,
-- masking whatever was actually saved via ParametresTab.
do $$
declare
  affected int;
begin
  update public.user_profiles
  set full_name = 'Enora Le Turnier'
  where id = 'b2c7b021-0699-4cf0-b5bb-88c7074fb67c';
  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'user_profiles rename: expected 1 row, got %', affected;
  end if;

  update public.designer_profiles
  set slug = 'enora-le-turnier'
  where user_id = 'b2c7b021-0699-4cf0-b5bb-88c7074fb67c';
  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'designer_profiles rename: expected 1 row, got %', affected;
  end if;
end $$;

-- Verification: confirm both columns actually landed on the expected row.
select up.id, up.full_name, dp.slug
from public.user_profiles up
join public.designer_profiles dp on dp.user_id = up.id
where up.id = 'b2c7b021-0699-4cf0-b5bb-88c7074fb67c';
