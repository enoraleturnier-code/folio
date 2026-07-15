-- Audit securite 15/07 : dispatch_webhook() authentifiait ses appels aux Edge
-- Functions webhook-* avec la cle publique (safe a exposer cote client, mais
-- ca veut aussi dire que n'importe qui peut appeler ces fonctions directement
-- avec cette meme cle publique et declencher des envois d'email arbitraires
-- -- verify_jwt:true ne verifie qu'"une cle Supabase valide", pas "c'est bien
-- notre trigger qui appelle"). Un secret partage stocke en Vault (jamais dans
-- une migration versionnee) permet aux Edge Functions de verifier que l'appel
-- vient bien de dispatch_webhook().
select vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'webhook_dispatch_secret',
  'Secret partage entre dispatch_webhook() (trigger Postgres) et les Edge Functions webhook-* -- verifie via le header x-webhook-secret, cf. get_webhook_dispatch_secret().'
);

-- Accesseur restreint : seul service_role peut l'appeler (REVOKE ci-dessous
-- retire anon/authenticated/public ; service_role bypass les grants de toute
-- facon). Utilise par les Edge Functions webhook-* (via leur client
-- service_role deja en place) pour recuperer la valeur attendue et la
-- comparer au header recu.
create or replace function public.get_webhook_dispatch_secret()
returns text
language sql
security definer
set search_path = public
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'webhook_dispatch_secret';
$$;

revoke execute on function public.get_webhook_dispatch_secret() from public, anon, authenticated;
