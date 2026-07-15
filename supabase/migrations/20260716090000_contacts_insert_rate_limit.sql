-- Audit securite 16/07 (RAPPORT_SECURITE.md, point faible #4) : contacts_insert_anyone
-- est le seul endpoint d'ecriture reellement ouvert a n'importe qui, sans
-- authentification prealable (contrairement aux demandes d'acces, qui exigent
-- un signUp() reel, deja soumis au rate limiting de Supabase Auth). Limite un
-- email a au plus 3 soumissions par tranche de 10 minutes -- ne remplace pas un
-- CAPTCHA (n'empeche pas la rotation d'emails jetables), mais coupe le spam
-- trivial d'un meme email en boucle, sans dependance a un service tiers.
--
-- Correctif applique dans la foulee (cf. migration suivante) : la 1ere version
-- de cette policy referencait `email` (nouvelle ligne) dans une sous-requete
-- correlee sur la meme table -- la portee SQL resout la reference vers l'alias
-- le plus proche (c.email = c.email, toujours vrai), pas vers la ligne en cours
-- d'insertion. Fichier conserve pour l'historique ; voir
-- 20260716090500_fix_contacts_insert_rate_limit.sql pour la version correcte.
drop policy if exists "contacts_insert_anyone" on public.contacts;

create policy "contacts_insert_anyone"
  on public.contacts for insert
  to anon, authenticated
  with check (
    type in ('contact', 'rdv')
    and name is not null
    and email is not null
    and consent_given_at is not null
    and (
      select count(*) from public.contacts c
      where c.email = email
        and c.created_at > now() - interval '10 minutes'
    ) < 3
  );
