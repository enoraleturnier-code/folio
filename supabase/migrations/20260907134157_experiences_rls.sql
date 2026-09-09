alter table public.experiences enable row level security;

-- deleted_at filtré explicitement dans la policy (pas seulement compté sur
-- l'app) -- même filet que projects_catalog_view : un admin authentifié a
-- accès total via experiences_admin (FOR ALL), donc sans ce filtre côté
-- lecture publique il verrait ses propres lignes supprimées réapparaître
-- sur SA PROPRE page profil publique.
create policy "experiences_select"
  on public.experiences for select
  to anon, authenticated
  using (deleted_at is null);

create policy "experiences_admin"
  on public.experiences for all
  to authenticated
  using (get_my_role() = 'admin')
  with check (get_my_role() = 'admin');
