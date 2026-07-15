# Rapport de sécurité — Folio+

**Date** : 15/07/2026 (mis à jour le 15/07/2026 — 2e passage ciblé sur l'historique git)
**Périmètre** : revue manuelle du repo (migrations SQL/RLS, Edge Functions, GRANT/REVOKE, policies storage, dépendances npm, code client) + advisor sécurité Supabase (`get_advisors`) + **scan complet de l'historique git** (`git log --all -p`, pas seulement l'état courant).
**Méthode** : lecture de code + introspection live de la base (`pg_policies`, `pg_proc`, `pg_trigger`, `has_function_privilege`, `vault.decrypted_secrets`) sur le projet Supabase `rctedezgdxadmkjeawsj`.

## Résumé

| Gravité | Nombre | Résumé |
|---|---|---|
| 🔴 Critique | 1 | ✅ **Corrigé le 15/07** — Secret `CRON_SYNC_SECRET` commité en clair dans l'historique git (poussé sur GitHub), tournait toujours avec la valeur d'origine |
| 🟡 Moyenne | 2 | Injection HTML dans les emails transactionnels ; protection "mot de passe compromis" désactivée |
| 🟢 Faible / informationnel | 3 | Garde-fou anti-auto-promotion admin reposant sur un seul trigger ; absence de limitation anti-abus sur les endpoints publics ; comparaison de secret non constant-time |

RLS activée sur toutes les tables, GRANT/REVOKE cohérents, policies storage correctes, `npm audit` propre. Le point critique a été corrigé le jour même (rotation complète, vérifiée) — reste les points moyens/faibles ci-dessous.

---

## 🔴 0. Secret `CRON_SYNC_SECRET` commité en clair, toujours actif (Critique) — ✅ Corrigé le 15/07

### Description
Un scan de l'historique complet (`git log --all -p`, et pas seulement l'état courant des fichiers) révèle que `CRON_SYNC_SECRET` — le secret qui authentifie le chemin cron de [`supabase/functions/sync-notion-veille/index.ts`](supabase/functions/sync-notion-veille/index.ts) — a été codé en dur dans le commit `d450e43` (13/07, "feat(veille) : integre la Veille Design Hebdo Notion -> Supabase") :
```ts
const CRON_SYNC_SECRET = "11ec190c68608885e91b50e8773ecde2732c1ee25aadb2fc1ee33c575d2c86b8";
```
Un commit suivant (`c43fbea`, même jour, "fix(veille) : deplace CRON_SYNC_SECRET en secret Edge Function, plus de hardcode") a bien déplacé la lecture vers `Deno.env.get("CRON_SYNC_SECRET")` — **mais la valeur elle-même n'a jamais été changée**. Vérifié directement en base (`vault.decrypted_secrets`) : le secret `cron_sync_secret` actuellement stocké en Vault est **exactement cette même valeur littérale**. Le commit `d450e43` est bien présent sur `origin/main` et `origin/feat/veille-design-hebdo-synchronisation` — donc poussé sur GitHub depuis le 13/07.

### Effet
N'importe qui ayant (ou ayant eu) accès au repo GitHub privé dispose de ce secret et peut appeler `sync-notion-veille` en contournant entièrement le contrôle "admin only" :
```
curl -X POST https://<projet>.functions.supabase.co/sync-notion-veille -H "x-cron-secret: 11ec190c68608885e91b50e8773ecde2732c1ee25aadb2fc1ee33c575d2c86b8"
```
Le repo étant privé, l'exposition reste limitée à qui a (eu) accès au repo — mais un secret ayant transité par l'historique git doit être considéré comme compromis, indépendamment de la visibilité du repo.

### ✅ Correctif appliqué
1. Nouvelle valeur aléatoire (256 bits) générée pour `cron_sync_secret`.
2. Mise à jour dans Supabase Vault via `vault.update_secret()` (le job `pg_cron` lit la valeur dynamiquement à chaque exécution via `vault.decrypted_secrets`, aucune modification de la migration nécessaire).
3. Mise à jour du secret de l'Edge Function `sync-notion-veille` (`CRON_SYNC_SECRET`, Dashboard Supabase → Edge Functions → Secrets).

**Vérifié par appel direct à la fonction déployée** :
- Ancienne valeur (celle qui avait fuité) → `403 forbidden` (rejetée, tombe sur le chemin "pas admin").
- Nouvelle valeur → `200 OK`, synchro fonctionnelle.

La rotation est complète et confirmée des deux côtés (Vault + Edge Function synchronisés).

---

## 🟡 1. Injection HTML dans les emails transactionnels

### Description
Dans [`supabase/functions/webhook-contact-created/index.ts`](supabase/functions/webhook-contact-created/index.ts) et [`supabase/functions/webhook-access-request-created/index.ts`](supabase/functions/webhook-access-request-created/index.ts), des champs contrôlés par un visiteur anonyme (`name`/`message` du formulaire de contact, `full_name` à l'inscription) sont interpolés **sans échappement** dans le HTML des emails envoyés à l'admin :

```ts
// webhook-contact-created/index.ts:82-83
<p><strong>${record.name || ""}</strong> (${record.email}) a envoyé un message :</p>
<blockquote>${record.message || ""}</blockquote>
```

```ts
// webhook-access-request-created/index.ts:88
<p>${visitor?.full_name || visitor?.email || "Un visiteur"} demande l'accès au projet <strong>${project?.title || ""}</strong>.</p>
```

### Effet
N'importe qui peut soumettre le formulaire public (ou créer un compte) avec `name`/`message`/`full_name` contenant du HTML arbitraire : liens de phishing déguisés, images de tracking (fuite d'IP/read-receipt), mise en page cassée. Pas d'exécution JS classique (la plupart des clients mail retirent `<script>`), mais c'est une injection HTML stockée qui atterrit dans la boîte mail de l'admin.

### Correctif recommandé
Échapper `<`, `>`, `&`, `"`, `'` avant interpolation dans les 4 fonctions `webhook-*` (une petite fonction `escapeHtml()` partagée suffit).

---

## 🟡 2. Protection "mot de passe compromis" désactivée

### Description
L'advisor sécurité Supabase (`auth_leaked_password_protection`) signale que la vérification contre HaveIBeenPwned.org est désactivée sur l'auth.

### Effet
Le flux `AccessRequestModal` crée de vrais comptes avec un mot de passe choisi par un inconnu (self-service, F-12) — sans cette protection, rien n'empêche l'usage d'un mot de passe déjà compromis dans une fuite connue.

### Correctif recommandé
Activer l'option dans Dashboard Supabase → Authentication → Policies (aucun changement de code nécessaire).

---

## 🟢 3. Garde-fou anti-auto-promotion admin reposant sur un seul trigger (informationnel)

### Description
La policy RLS `user_profiles_update_own` (`WITH CHECK (id = auth.uid())`) ne restreint pas la colonne `role` — à elle seule, elle laisserait n'importe quel utilisateur authentifié s'attribuer `role = 'admin'` via un `UPDATE` direct. Ce qui bloque réellement cette escalade aujourd'hui est le trigger `trg_prevent_role_self_update` (`BEFORE UPDATE OF role ON user_profiles`, fonction `prevent_role_self_update()`), qui lève une exception si un non-admin tente de changer son propre `role`.

### Effet
Aucun aujourd'hui — le trigger fonctionne et a été vérifié (`SECURITY DEFINER`, logique correcte : compare `NEW.role`/`OLD.role`, vérifie `auth.uid() = OLD.id`, vérifie le rôle courant via une sous-requête). Mais c'est un **point de défaillance unique** : si ce trigger est un jour supprimé ou modifié par inadvertance (ex. nettoyage futur de migrations) sans que la dépendance soit connue, l'escalade de privilèges redevient possible via la seule RLS.

### Recommandation
Documenter explicitement ce lien dans `CLAUDE.md` (section RLS — pièges à ne pas reproduire), pour qu'une future session ne supprime jamais ce trigger sans réaliser qu'il est la seule protection sur `role`. Alternative plus robuste : ajouter aussi une contrainte au niveau du `WITH CHECK` de la policy elle-même (défense en profondeur), mais non urgent tant que le trigger reste en place.

---

## 🟢 4. Absence de limitation anti-abus sur les endpoints publics (gravité faible)

### Description
`contacts_insert_anyone` (formulaire de contact) et la création de compte via `AccessRequestModal` sont ouverts à tout le monde, sans CAPTCHA ni throttling.

### Effet
Combiné au point #1, un script pourrait spammer des demandes/contacts : coût en quota Resend, comptes fantômes en base, boîte mail admin encombrée. Faible priorité pour un portfolio personnel à trafic limité, mais à garder en tête si le formulaire devient une cible (ou si le volume de trafic augmente).

---

## 🟢 5. Comparaison du secret webhook non "constant-time" (négligeable)

### Description
Dans les 4 fonctions `webhook-*` et `sync-notion-veille`, la vérification du secret partagé utilise une comparaison de chaînes standard (`provided === expected`), potentiellement sensible à une attaque par timing (deviner le secret octet par octet en mesurant les différences de latence).

### Effet
Risque pratique quasi nul pour une cible à faible valeur comme celle-ci (le jitter réseau domine largement toute différence de timing mesurable). Mentionné pour complétude.

### Recommandation (optionnelle)
Utiliser une comparaison en temps constant si on veut blinder complètement (`crypto.timingSafeEqual` ou équivalent Deno).

---

## Vérifié et sain (pas d'action nécessaire)

- **RLS** activée sur toutes les tables `public.*`.
- **GRANT/REVOKE** cohérents sur les fonctions sensibles : `dispatch_webhook`, `get_webhook_dispatch_secret`, `handle_new_user`, `prevent_role_self_update`, `create_access_request_notifications` — non exécutables par `anon`/`authenticated` (vérifié via `has_function_privilege`). `get_my_role`/`get_public_cal_username`/`project_deletion_status` sont intentionnellement publiques et ne fuient aucune donnée au-delà de ce qui est déjà public (vérifié le contenu de chaque fonction).
- **`soft_delete_project`** : callable par `anon`/`authenticated` au niveau GRANT, mais protégée en pratique car `SECURITY INVOKER` (pas `DEFINER`) — les `UPDATE`/`DELETE` internes sont filtrés par RLS selon l'appelant, et la fonction vérifie explicitement qu'une ligne a bien été affectée avant de retourner un succès.
- **Policies storage** (`project-thumbnails`, `designer-photos`) : écriture admin-only, pas de policy SELECT superflue (pas de listing public possible).
- **`anonymize-rgpd`** : la cible est toujours résolue depuis le JWT de l'appelant (`auth.getUser()`), jamais depuis le corps de la requête — un utilisateur ne peut anonymiser que son propre compte.
- **`.env`** : jamais tracké actuellement (`git ls-files` vide), bien couvert par `.gitignore` (`.env` + `.env.*`, exception uniquement pour `.env.example`). `.env.admin` (service role key, utilisé par `scripts/`) n'a **jamais** été commité, à aucun moment de l'historique.
- **Séparation clé publique/secrète** : [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts) ne charge que `VITE_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`) côté client — aucune occurrence de `sb_secret_` ou de la service role key dans le bundle, actuellement ou dans l'historique.
- **Historique git — nuance** : un `.env` initial (commit `3dcab73`, 06/07) a bien été commité puis supprimé, mais ne contenait qu'une clé **publiable** (`sb_publishable_...`, faite pour être publique) et l'URL du projet Lovable Cloud d'origine — sans risque. Le scan complet de l'historique (`git log --all -p`) a en revanche révélé le secret `CRON_SYNC_SECRET` en clair (cf. point critique #0 ci-dessus) — c'est le seul vrai secret trouvé, mais il est réel et toujours actif.
- **Dépendances** : `npm audit --production` → 0 vulnérabilité connue.
- **XSS côté client** : aucun `dangerouslySetInnerHTML` actif (seule occurrence dans le code mort `src/components/ui/chart.tsx`, jamais importé) ; `MarkdownContent.tsx` (react-markdown) n'utilise aucun plugin de rendu HTML brut (pas de `rehype-raw`).
