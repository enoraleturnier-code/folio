-- Audit securite 15/07 : la policy INSERT s'appelait "trigger_only" mais ne
-- verifiait que id = auth.uid(), jamais la colonne role. handle_new_user()
-- (SECURITY DEFINER) cree deja la ligne avec role='pending' par defaut, donc
-- ca ne changeait rien en pratique -- sauf si la ligne venait a manquer
-- (ex. suppression via user_profiles_delete_admin) : l'utilisateur pouvait
-- alors se re-inserer lui-meme avec role='admin' via un INSERT direct.
drop policy if exists "user_profiles_insert_trigger_only" on public.user_profiles;

create policy "user_profiles_insert_trigger_only"
  on public.user_profiles for insert
  to authenticated
  with check (id = (select auth.uid()) and role = 'pending');
