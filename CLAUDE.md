# Folio+ — Notes pour Claude Code

Notes condensées à l'essentiel (réduit le 13/07 — l'historique détaillé par session existe encore dans `git log`/les commits si besoin de retrouver le raisonnement complet d'un choix).

## Design system

- **`DESIGN.md`** (racine du repo) est la référence **unique** pour les couleurs, la nomenclature M3 et les ratios WCAG déjà vérifiés. Le consulter avant tout changement de `src/styles.css` ou de token. Règle permanente : toute session qui touche le design system met à jour `DESIGN.md` dans la foulée, pas seulement sur demande.
- Tokens définis **uniquement** dans `src/styles.css` (`@theme inline` + `:root`/`.dark`/`:root:not(.dark)`). Pas de `tailwind.config.*` (Tailwind v4, CSS-first).
- `src/components/ui/` (shadcn) = code mort confirmé, ne pas modifier sans demande explicite de le réactiver.
- **Icônes** : Lucide uniquement (`lucide-react`), jamais Material Symbols. Règle globale `styles.css` (`@layer base`) : `.lucide { stroke-width: 1.5 }` (uniforme, plus d'exception sous 16px) + `cursor: pointer` systématique sur `button`/`[role="button"]`/`a[href]`/`select`/`label[for]`/checkbox/radio.
- **Nav admin** (`AdminSidebar`, `AdminPage.tsx`) : couleur par section via `NAV_ACTIVE_CLASSES`, détail complet (valeurs, ratios) dans `DESIGN.md` section "Couleurs de nav active + badges". Les halos `SectionAurora` de chaque section sont volontairement dissociés de cette couleur de nav depuis le 13/07 — ne pas chercher à les réaligner.
- **⚠️ Divergence non résolue** : `secondary` vaut `#7c3aed` dans `styles.css` (dark) mais `DESIGN.md` liste `#D2BBFF` — à trancher avec l'utilisatrice avant la passe light mode, ne pas corriger à l'aveugle.
- **Reste à faire — mode light** : les 8 tokens de marque (`primary`/`secondary`/`tertiary` + variantes container/on-container) n'ont aucune valeur en light, héritent silencieusement du dark. Tâche reportée explicitement par l'utilisatrice. Prévoir aussi le remplacement des bordures `border-white/X` (quasi invisibles en light).

## Base de données / RLS — pièges à ne pas reproduire

- **`security_invoker` sur les vues** : `CREATE OR REPLACE VIEW` ne préserve pas cette option si elle n'est pas re-précisée — retombe en mode `SECURITY DEFINER` implicite (bypass RLS). Toujours `ALTER VIEW ... SET (security_invoker = true)` après un `CREATE OR REPLACE VIEW`, et vérifier avec `select reloptions from pg_class where relname = '...'` (`null` = dangereux). Déjà arrivé une fois sur `projects_catalog_view` (draft visible par anon).
- **Ne jamais supposer qu'un `UPDATE`/`DELETE` a réussi juste parce qu'il n'a pas levé d'erreur** — RLS peut filtrer 0 ligne silencieusement. Toujours vérifier via `RETURNING ... INTO` + check `null`/`GET DIAGNOSTICS` avant de retourner un succès à l'appelant (pattern déjà en place dans `soft_delete_project`, `updateProject*`, `approve/rejectAccessRequest`).
- **Récursion croisée RLS** : deux policies sur deux tables qui se référencent mutuellement en sous-requête directe déclenchent `42P17`. Passer par des fonctions `SECURITY DEFINER` (comme `get_my_role()`) qui bypassent RLS plutôt qu'une sous-requête brute inter-tables.
- Audit connu, non corrigé (risque faible) : `syncProjectTags()` et `AccessRequestModal.handleSubmit` (`UPDATE user_profiles`) ne vérifient pas le nombre de lignes affectées.

## Flux métier

- **Accès confidentiel (F-12)** : 4 états carte (`none`/`pending`/`refused`/`granted`, calculés dans `CataloguePage.resolveAccess`). Un accès `approved` débloque **un seul projet**, jamais le rôle global (seul `validated_visitor` débloque tout). **F-11 (auto-approbation) supprimée** (13/07) — toute demande passe désormais systématiquement par `pending` puis validation manuelle de Léa, quel que soit `sensitivity_level`.
- **RGPD (F-24)** : self-service uniquement (`anonymize-rgpd`, cible toujours le JWT appelant). Anonymise (`user_profiles`/`access_requests.message`/`contacts`), ne supprime jamais la ligne `user_profiles` (FK réelles depuis `access_requests`/`contacts`), supprime `auth.users` en dernier.
- **Paramètres admin (`ParametresTab`)** : formulaire encore **mock** — `useState` depuis `src/data/designer.ts`, `onSubmit` ne fait que `setSaved(true)`. Ne persiste rien de réel malgré l'existence de vraies tables `designer_profiles`/`admin_settings` (RLS active, jamais câblées). À reprendre si la persistance réelle devient nécessaire.
- **Webhooks Resend** (`dispatch_webhook()` générique + 4 triggers) : domaine non vérifié → tous les emails partent de `onboarding@resend.dev` (mode test). `normalizeGmail()` strip le `+alias` avant envoi (Resend fait une comparaison stricte, ignore les alias Gmail) — uniquement pour gmail.com/googlemail.com.
- **IA de structuration** (`generate-ai-description`) : utilise Mistral (`mistral-small-latest`), pas Anthropic (migré pour coût). Limites de caractères par champ dupliquées manuellement entre l'Edge Function (`FIELD_MAX_LENGTH`) et `src/lib/projectValidation.ts` (`MAX_LENGTHS`) — aucun import partageable Vite/Deno, garder synchronisé à la main.

## Comptes de test

- **Toujours de vraies adresses Gmail + alias** (`enoraleturnier+xxx@gmail.com`), jamais un domaine inventé — Resend doit pouvoir délivrer réellement. `PersonaSwitcher.tsx` (dev-only) a les emails en dur (`PERSONAS`) : à resynchroniser si les comptes changent.
- Scripts admin réutilisables dans `scripts/` (lisent `SUPABASE_SERVICE_ROLE_KEY` depuis `.env.admin`, gitignored).

## Architecture

- **Routing** : React Router SPA pure (`createBrowserRouter`), plus de TanStack Start/SSR. `src/router.tsx` (routes+loaders), `src/main.tsx` (entry CSR), `index.html` statique avec script `THEME_INIT` inline (seul responsable de la classe `dark`/`light` sur `<html>`, avant tout rendu React).
- **Storage** : bucket `project-thumbnails` (public, écriture admin only) pour les thumbnails projets.
- **Versioning** : SemVer dès `main` — `fix:` → PATCH, `feat:` → MINOR (reste en `0.x`, `1.0.0` sera délibéré). Toute fusion sur `main` avec changement utilisateur significatif doit être suivie d'un tag + release GitHub.
