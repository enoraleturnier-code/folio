-- Active pg_cron pour la synchro hebdomadaire Veille Design Hebdo (Notion -> design_watch_entries).
-- Reutilise pg_net (deja actif pour dispatch_webhook, PRD 7.3) plutot que d'introduire un
-- nouveau mecanisme d'appel HTTP.
create extension if not exists pg_cron;

-- Cadence hebdomadaire (le nom "Veille Design Hebdo" + convention "Semaine du X" cote Notion
-- confirment le rythme reel) : chaque lundi 8h UTC. Le secret x-cron-secret est lu depuis
-- Supabase Vault (jamais commite -- cree via execute_sql, pas via cette migration) -- cf.
-- sync-notion-veille/index.ts pour le detail du tradeoff de securite (secret hardcode cote
-- Edge Function faute d'acces aux secrets Deno.env via les outils disponibles).
select cron.schedule(
  'sync-notion-veille-hebdo',
  '0 8 * * 1',
  $cron$
  select net.http_post(
    url := 'https://rctedezgdxadmkjeawsj.supabase.co/functions/v1/sync-notion-veille',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_BhYR0mj5TJnXnSP6wJT-FA_Otm6HuKv',
      'apikey', 'sb_publishable_BhYR0mj5TJnXnSP6wJT-FA_Otm6HuKv',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_sync_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 15000
  ) as request_id;
  $cron$
);
