# 🛠️ Documentation technique / Handover

## 🌐 Vue d'ensemble

Front React 19 (Vite, React Router, Tailwind v4) déployé sur Vercel, connecté à Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions, pg_cron). Des Edge Functions appellent l'API Mistral pour la structuration IA, gèrent l'anonymisation RGPD, et relaient les webhooks Resend pour les emails transactionnels.

## 🧰 Stack et versions

React 19, Vite, React Router, Tailwind v4, Supabase (PostgreSQL, Auth, RLS, Storage, Edge Functions, pg_cron), Resend, Mistral AI (`mistral-small-latest`), Cal.com (`@calcom/embed-react`), Claude Code, Claude Cowork, GitHub, Vercel.

## 🗄️ Modèle de données

| Table | Rôle | Relations | RLS (résumé) |
| --- | --- | --- | --- |
| `user_profiles` | Identité et rôle de tout utilisateur (pending/validated_visitor/admin/rejected) | liée à `auth.users.id` via trigger `handle_new_user` | chaque user lit son propre profil, admin lit tous, rôle modifiable admin uniquement (trigger anti auto-promotion) |
| `projects` | Fiches projet, soft delete, statut, sensibilité | référencée par `access_requests`, `project_tools/keywords/types` | anon/pending : public + teaser confidentiel via vue, validated : tous statuts non-draft, admin : accès total |
| `access_requests` | Demande d'accès par projet (1 ligne / projet / session) | FK `user_id → user_profiles`, `project_id → projects` | INSERT si rôle pending, SELECT admin + auteur de la demande, UPDATE admin uniquement |
| `contacts` | Messages et demandes de contact | FK optionnelle `user_id → user_profiles` | INSERT public avec contraintes anti-spam et rate limit (3/email/10min), SELECT/UPDATE admin uniquement |
| `designer_profiles` | Présentation publique du designer + slug URL | FK `user_id → user_profiles` | SELECT public, UPDATE admin uniquement |
| `admin_settings` | Configuration privée (`cal_username`) | FK `user_id → user_profiles` | admin uniquement en direct, lecture publique de `cal_username` seule via fonction `get_public_cal_username()` SECURITY DEFINER |
| `tools_ref` / `keywords_ref` / `project_types_ref` | Listes normalisées (filtres catalogue) | liées via tables de liaison N-N | SELECT public, INSERT/UPDATE admin |
| `project_tools` / `project_keywords` / `project_types` | Liaisons N-N projets ↔ référentiels | FK vers `projects` et la table ref correspondante | SELECT public sur projets visibles, admin accès total |
| `notifications` | Notifications admin/visiteur (nouvelle demande, résolution) | trigger `access_requests_notify` | chacun ne voit/modifie que ses propres notifications (`user_id = auth.uid()`) |
| `projects_catalog_view` | Vue agrégée pour le catalogue (filtre les champs selon le rôle) | dérivée de `projects` et tables de liaison | `security_invoker = true`, à revérifier après tout `CREATE OR REPLACE VIEW` |

## 🔑 Variables d'environnement

| Variable | Rôle | Où la configurer |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | URL du projet Supabase | Vercel + `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase | Vercel + `.env` |
| `MISTRAL_API_KEY` | Clé de la feature IA (structuration) | Vercel côté serveur / Edge Function uniquement, jamais côté client |
| `NOTION_API_KEY` | Clé d'intégration Notion, utilisée par l'Edge Function `sync-notion-veille` (proxy) | Vercel/Supabase côté serveur uniquement, jamais exposée au front |
| `RESEND_API_KEY` | Clé d'envoi des emails transactionnels (Database Webhooks → Resend) | Supabase côté serveur uniquement |
| `CRON_SYNC_SECRET` | Secret générique utilisé par pg_cron pour authentifier son appel à `sync-notion-veille`, séparé de `NOTION_API_KEY`, le cron ne transporte jamais la vraie clé métier. Rotation complète effectuée le 15/07 après découverte dans l'historique git, voir le rapport de sécurité. | Supabase Secrets (Edge Function) + Vault, référencé dans la commande du cron job |
| `SUPABASE_SERVICE_ROLE_KEY` ✅ Migrée | Nom de variable inchangé (legacy), mais la valeur stockée est désormais la nouvelle clé secrète `sb_secret_...` (mêmes privilèges, révocable individuellement), plus l'ancienne clé `service_role` dépréciée. Bypass complet des RLS, la plus sensible du projet. Utilisée pour des tests/scripts admin ponctuels (dossier `scripts/`), pas par l'app elle-même. | Valeur `sb_secret_...` copiée depuis le dashboard Supabase (onglet API Keys, clé secrète) vers un fichier `.env.admin` local (gitignored) uniquement, jamais sur Vercel, jamais côté client, jamais dans une Edge Function exposée |

## 🔌 Intégrations externes

- **API IA** : API Mistral, appelée par l'Edge Function `generate-ai-description`, génère un draft en 3 blocs (Problème/Décisions/Résultat) + suggestions tools/keywords/types normalisés. Ne fonctionne pas sans `MISTRAL_API_KEY` configurée. En cas d'échec : message d'erreur, les champs restent éditables manuellement (aucun blocage).
- **Automatisation** : workflow Claude Cowork qui alimente une base Notion (veille design hebdo), synchronisée vers Supabase via l'Edge Function `sync-notion-veille` (upsert dans `design_watch_entries`), planifiée par pg_cron. Un bouton « Forcer une synchro maintenant » est aussi disponible côté dashboard. L'appel à l'API Notion passe par cette Edge Function comme proxy, `NOTION_API_KEY` n'est jamais exposée au client.
- **Emails transactionnels** : Resend, déclenché par 4 Database Webhooks Supabase (création de compte, demande d'accès, validation/refus, contact). Domaine non vérifié en l'état, tous les emails partent de `onboarding@resend.dev` (mode test), latence de livraison possible.
- **Prise de RDV *(en cours de développement)*** : widget Cal.com (`@calcom/embed-react`), CSS vars alignées sur le design system. Aucune donnée de RDV stockée côté Supabase. Affiché uniquement si `cal_username` est renseigné (sinon le bloc disparaît sans erreur).

## ☁️ Déploiement et CI

Vercel connecté au repo GitHub (projet `folio`, team `enora-le-turnier-s-projects`). Chaque push sur `main` déclenche un déploiement de production automatique, chaque branche/PR génère un déploiement preview. Pas encore de domaine personnalisé, l'app tourne sous `*.vercel.app`.

## 💻 Lancer en local

```bash
git clone [url-du-repo]
cd folio-plus
npm install
cp .env.example .env   # puis remplir les variables
npm run dev
```

## ⚠️ Points de vigilance

**À vérifier avant la soutenance (actions concrètes) :**

- **PersonaSwitcher sur les previews Vercel** : dépend de 2 réglages manuels dans le dashboard Vercel (Environment Variables → auto-expose des variables système, Deployment Protection sur les previews). Sans le réglage Deployment Protection, une URL de preview trouvée reste un accès admin en un clic. Voir le [rapport de sécurité](RAPPORT_SECURITE.md) pour le détail.
- `security_invoker` sur les vues Postgres n'est pas préservé par un `CREATE OR REPLACE VIEW`, retombe en mode `SECURITY DEFINER` implicite (bypass RLS) si oublié. Déjà correct aujourd'hui, mais à re-vérifier après toute future modification de la vue.

**Info seulement, aucune action requise :**

- Emails Resend envoyés depuis `onboarding@resend.dev` (domaine non vérifié) : latence de livraison déjà observée (plusieurs minutes), ne pas conclure trop vite à un bug si l'email n'est pas encore arrivé juste après un test
- `SUPABASE_SERVICE_ROLE_KEY`, migration sur `sb_secret_...` déjà faite, rien à refaire, garder le réflexe de ne jamais l'exposer
- Ne jamais supposer qu'un `UPDATE`/`DELETE` a réussi juste parce qu'il n'a pas levé d'erreur, RLS peut filtrer 0 ligne silencieusement (pattern `RETURNING ... INTO` + check déjà en place sur la plupart des opérations)
- Thème light non terminé, actuellement forcé en dark uniquement, décision déjà actée, hors scope jury
- Widget Cal.com pas encore développé (`CalEmbed.tsx` en placeholder), correctement dépriorisé en V2
- Divergence de token de couleur `secondary` (`#7c3aed` dans le code vs `#D2BBFF` cible Material 3 dark), esthétique, zéro impact WCAG confirmé par l'audit, correction prévue dans la 2e passe WCAG

> ✅ **Audit de sécurité complet** : voir le [rapport d'audit de sécurité](RAPPORT_SECURITE.md). Tous les points corrigeables ont été traités le 16/07 (injection HTML, rate limit, comparaison constant-time), seule la protection mot de passe compromis reste bloquée par le plan Supabase Free.

## Contact

Enora Le Turnier · Projet fil rouge Bootcamp Vibe Coding.
