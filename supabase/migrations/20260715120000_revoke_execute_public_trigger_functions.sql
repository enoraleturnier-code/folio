-- Le REVOKE EXECUTE du 24/06 (20260624101600_audit_corrections_v2_0.sql) ne
-- ciblait que anon/authenticated, jamais PUBLIC. Or ces roles heritent des
-- privileges accordes a PUBLIC par defaut a la creation d'une fonction, donc
-- le revoke precedent n'a rien change en pratique (verifie via pg_proc.proacl :
-- les 4 fonctions restaient executables par anon/authenticated). Risque reel
-- nul ici (ce sont des fonctions `returns trigger`, Postgres refuse de les
-- executer hors contexte de trigger), mais on ferme le trou proprement pour
-- respecter le moindre privilege et faire taire l'advisor Supabase.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.prevent_role_self_update() from public;
revoke execute on function public.dispatch_webhook() from public;
revoke execute on function public.create_access_request_notifications() from public;
