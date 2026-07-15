-- Correctif : la 1ere version (20260716090000_contacts_insert_rate_limit.sql)
-- referencait `email` (nouvelle ligne) dans une sous-requete correlee sur la
-- meme table -- la portee SQL resout la reference vers l'alias le plus proche
-- (c.email = c.email, toujours vrai), pas vers la ligne en cours d'insertion.
-- Verifie en pratique (RAPPORT_SECURITE.md) : 4 soumissions rapides avec le
-- meme email passaient toutes en 201 avant ce correctif.
--
-- Extrait le comptage dans une fonction SECURITY DEFINER (necessaire : la
-- policy SELECT sur contacts est admin-only, donc un simple SECURITY INVOKER
-- ne verrait aucune ligne pour anon/authenticated et compterait toujours 0)
-- qui prend l'email en parametre, sans ambiguite de portee -- verifie apres
-- coup : 3 soumissions passent, la 4e est rejetee (42501), un email different
-- n'est pas affecte par la limite d'un autre.
create or replace function public.contacts_recent_count(p_email text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.contacts
  where email = p_email
    and created_at > now() - interval '10 minutes';
$$;

revoke all on function public.contacts_recent_count(text) from public;
grant execute on function public.contacts_recent_count(text) to anon, authenticated;

drop policy if exists "contacts_insert_anyone" on public.contacts;

create policy "contacts_insert_anyone"
  on public.contacts for insert
  to anon, authenticated
  with check (
    type in ('contact', 'rdv')
    and name is not null
    and email is not null
    and consent_given_at is not null
    and public.contacts_recent_count(email) < 3
  );
