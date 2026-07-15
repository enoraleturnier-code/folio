-- Suite de 20260715130000 : dispatch_webhook() ajoute le header
-- x-webhook-secret (lu depuis Vault, jamais en dur ici) verifie par chaque
-- Edge Function webhook-*. L'Authorization/apikey (cle publique) restent
-- necessaires en plus -- c'est ce qui satisfait verify_jwt:true au niveau de
-- la gateway Supabase, une couche differente du check applicatif ajoute ici.
create or replace function public.dispatch_webhook() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  function_slug text := TG_ARGV[0];
  payload jsonb;
  webhook_secret text;
begin
  webhook_secret := public.get_webhook_dispatch_secret();

  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) else null end,
    'old_record', case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) else null end
  );

  perform net.http_post(
    url := 'https://rctedezgdxadmkjeawsj.supabase.co/functions/v1/' || function_slug,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_BhYR0mj5TJnXnSP6wJT-FA_Otm6HuKv',
      'apikey', 'sb_publishable_BhYR0mj5TJnXnSP6wJT-FA_Otm6HuKv',
      'x-webhook-secret', webhook_secret
    ),
    body := payload
  );

  return coalesce(NEW, OLD);
end;
$$;

comment on function public.dispatch_webhook() is 'Relaie les evenements INSERT/UPDATE vers une Edge Function (PRD 7.3, webhooks Supabase -> Resend). Slug de la fonction cible passe en argument de trigger. Header x-webhook-secret (Vault) verifie cote Edge Function pour empecher un appel direct non autorise (audit securite 15/07).';
