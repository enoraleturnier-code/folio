-- Active pg_net pour les appels HTTP async depuis Postgres (Database Webhooks)
create extension if not exists pg_net with schema extensions;

-- Fonction generique : relaie un evenement INSERT/UPDATE vers une Edge Function
-- Le nom de l'Edge Function cible est passe en argument du trigger (TG_ARGV[0])
-- Authentification : cle anon publique (safe a embarquer, deja exposee cote client)
create or replace function public.dispatch_webhook() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  function_slug text := TG_ARGV[0];
  payload jsonb;
begin
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
      'apikey', 'sb_publishable_BhYR0mj5TJnXnSP6wJT-FA_Otm6HuKv'
    ),
    body := payload
  );

  return coalesce(NEW, OLD);
end;
$$;

comment on function public.dispatch_webhook() is 'Relaie les evenements INSERT/UPDATE vers une Edge Function (PRD 7.3, webhooks Supabase -> Resend). Slug de la fonction cible passe en argument de trigger.';
