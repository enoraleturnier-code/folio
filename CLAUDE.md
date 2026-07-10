# Folio+ — Notes pour Claude Code

## Architecture routing — migration TanStack Start → React Router (08/07, terminée)

Le routing est passé de **TanStack Start** (SSR Nitro + file-based routing) à une **SPA Vite pure** avec **React Router** (data router, `createBrowserRouter`/`RouterProvider`) — plus aucun méta-framework de routing, plus de SSR. Migration exécutée sur `feat/migration-react-router`, non encore commitée au moment de la rédaction de cette note.

- **Fichiers clés** :
  - `index.html` — head statique (meta/OG/Twitter/fonts/favicon) + script `THEME_INIT` inline (voir note hydration ci-dessous). Remplace l'ancien `head()` de `src/routes/__root.tsx`.
  - `src/main.tsx` — entry point Vite classique : `createRoot(...).render(<RouterProvider router={router}/>)`.
  - `src/router.tsx` — arbre de routes complet avec `loader`/`errorElement`/`redirect`, portage direct des anciens `loader()` TanStack (même nom de hook `useLoaderData()`, même sémantique 404 via `throw new Response(..., {status:404})` capté par `errorElement`).
  - `src/pages/*.tsx` — un composant par route (remplace `src/routes/` file-based, supprimé). `RootLayout.tsx` = `QueryClientProvider` + `<ScrollRestoration/>` + `PersonaSwitcher` (dev only). `RouteError.tsx` = 404 + erreur générique unifiées (remplace `notFoundComponent`/`errorComponent`).
  - `vercel.json` — rewrite SPA (`/(.*) → /index.html`) pour que le F5 sur une route profonde ne 404 pas en prod. En dev, Vite gère le fallback SPA nativement, rien à configurer.
- **URLs inchangées** : `/` (redirect), `/:slug`, `/:slug/projects`, `/:slug/projects/:id`, `/admin` (+ `?tab=`), `/auth`, `/account`, `*` (404).
- **Rien n'a bougé côté métier** : `src/data/*`, `src/hooks/useAuth.ts`, le client Supabase et le masquage RLS des projets confidentiels tournaient déjà 100% côté client (RLS appliqué par Postgres, `get_my_role()` appelé depuis `useAuth()`) — totalement indépendants du routeur, donc non touchés par la migration.
- **Supprimé** : `src/server.ts`, `src/start.ts`, `src/routes/`, `routeTree.gen.ts`, l'ancien `src/router.tsx` TanStack, `auth-attacher.ts`/`auth-middleware.ts`/`client.server.ts` (plomberie SSR jamais consommée par aucune route), `error-capture.ts`/`error-page.ts` (wrapper d'erreurs SSR). Dépendances retirées : `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`, `@lovable.dev/vite-tanstack-config`, `nitro`. `vite.config.ts` est maintenant une config Vite standard (`@vitejs/plugin-react` + `@tailwindcss/vite` + `vite-tsconfig-paths`, port 8080 fixé pour matcher `.claude/launch.json`).
- **Non touché, comme prévu** : `src/components/ui/` (shadcn, code mort), `DESIGN.md`/`src/styles.css`, tout le contenu JSX/Tailwind des pages.

## Design system couleur — source de vérité

**`DESIGN.md`** (fourni par l'utilisateur, hors repo à `C:\Users\user24\Desktop\DESIGN.md` — a déménagé de `Downloads\` le 09/07 ; toujours hors repo, à rapatrier si besoin de le versionner) est la référence **unique** pour toutes les valeurs de couleur, la nomenclature M3, et les ratios WCAG/RGAA vérifiés. Toujours le consulter avant de toucher à `src/styles.css` ou d'ajouter un token couleur.

**Règle permanente** : dès qu'une session modifie le design system (nouveau token, nouvelle couleur, nouveau composant visuel type Alert/Badge), mettre à jour `DESIGN.md` dans la foulée — ce n'est pas une étape optionnelle en fin de session. Si un composant du code s'écarte de ce que documente `DESIGN.md`, corriger le composant (le doc fait foi), sauf divergence explicitement déjà actée comme "à trancher avec l'utilisateur" (voir ci-dessous).

**Corrections appliquées le 09/07 suite à audit composants vs DESIGN.md** :
- `--tag-sector` (`src/styles.css`) : `#22d3ee` → `#06b6d4` (ne correspondait pas à la valeur "cyan" documentée).
- `--tag-tools` : `#38bdf8` → `#0ea5e9` (ne correspondait pas à la valeur "sky" documentée).
- `TagBadge.tsx` utilisait des couleurs Tailwind brutes (`fuchsia-500`, `cyan-500`, etc.) mélangées à des hex arbitraires au lieu des tokens sémantiques `tag-*` déjà câblés dans `@theme inline` — remplacé par `bg-tag-*/10 border-tag-*/30 text-tag-*` partout.
- Badge "Accès accordé" (F-12, `ProjectCard.tsx`) renommé en "Confidentiel · Accès validé" pour matcher le libellé documenté.

**Contradiction DESIGN.md tranchée** : la section "🎫 Badges de statut d'accès (F-12)" (pastilles neutres) était obsolète par rapport à la section "🔔 Système d'alertes" — l'implémentation retenue et validée utilise bien le composant `Alert` coloré (info/tertiary pour pending, warning/ambre pour rejected). C'est la référence désormais ; DESIGN.md reste à corriger pour supprimer l'ancienne section si besoin.

Les tokens sont définis **uniquement** dans `src/styles.css` (`@theme inline` + blocs `:root, .dark` et `:root:not(.dark)`). Pas de `tailwind.config.*` (Tailwind v4, config CSS-first). `src/components/ui/` (shadcn) est **du code mort confirmé** — aucun fichier applicatif ne l'importe (vérifié par grep exhaustif) ; ne pas le modifier sauf demande explicite de le réactiver.

## État du dark mode — ✅ TERMINÉ, conforme AA

Le dark mode est clos. Récapitulatif de ce qui a été fait :

- **Mapping M3 `primary` vs `primary-container`** appliqué : `primary` (`#57F1DB`) réservé aux icônes/accents, **jamais** un fill de bouton ; `primary-container` (`#2DD4BF`) porte les CTA/boutons/états actifs. **19 boutons** interactifs qui utilisaient `bg-primary` ont été reclassés en `bg-primary-container` (aucun changement de rendu visuel : `primary-container` a repris l'ancienne valeur de `primary`).
- **6 éléments décoratifs** (avatars initiales, cercles d'icônes calendrier, trait décoratif) traités en `bg-on-primary` (`#003731`) + `text-primary` (`#57F1DB`), ratio 9.44:1 — délibérément **pas** `primary-container`, pour ne pas les confondre avec des boutons.
- **3 paires container corrigées** (contraste dark limite → confortable) :
  - `on-primary-container` : `#00574D` → `#00201C` (4.57:1 → 9.22:1)
  - `on-secondary-container` : `#C9AEFF` → `#EADDFF` (4.53:1 → 6.72:1)
  - `on-tertiary-container` : `#3A2CD2` → `#130E43` (9.63:1 avec `tertiary-container`)
- **`tertiary-container` / `on-tertiary-container` ajoutés** au thème dark (étaient absents) + leur mapping dans `@theme inline`.
- **`StatusBadge.tsx` — `public` harmonisé** : `bg-primary/20` → `bg-primary/10` (aligné sur le pattern uniforme des autres pastilles ; `text-primary` conservé, contraste 10.67:1). Le badge `confidential` (`bg-secondary/80` + `text-on-surface`, 5.79:1) est **volontairement gardé en fill fort** (rôle d'alerte pour un label CONFIDENTIEL) — ne pas y toucher.
- **Audit héritage bordures** (`@layer base { * { border-color: var(--outline-variant) } }`) : clos. Toutes les bordures de l'app (hors `ui/`) déclarent une couleur explicite — aucune bordure fonctionnelle « nue ». La règle globale est un filet de sécurité inoffensif, aucune correction nécessaire.

## Flux "demande d'accès confidentiel" (F-12) — implémenté, réel (pas un mock)

`ProjectCard.tsx` a 4 états d'accès pour un projet confidentiel — calculés dans `CataloguePage.tsx` (`resolveAccess`) à partir du rôle global (`get_my_role()`) **et** des lignes `access_requests` propres au visiteur connecté (`src/data/accessRequests.ts`) :
- **none** → carte cliquable, ouvre `AccessRequestModal`.
- **pending** → carte inerte, `Alert` type info.
- **refused** → carte inerte, `Alert` type warning + lien vers la section contact du profil.
- **granted** → badge "Confidentiel · Accès validé", carte = lien direct vers la fiche complète.

**Important** : une ligne `access_requests.status = 'approved'` débloque **un seul projet précis** pour ce visiteur, sans changer son rôle global (`validated_visitor` reste le seul rôle qui débloque *tous* les confidentiels — vérifié en base : approuver une demande ne touche jamais `user_profiles.role`, aucun trigger ne le fait non plus). Ce mécanisme est reconnu à deux endroits qu'il faut garder synchronisés si on retouche les RLS : la policy `projects_select_unified` (branche `exists (select 1 from access_requests ...)`) et `getProjectById` (`src/data/projects.ts`, fiche détail complète).

**⚠️ Piège RLS récursion croisée** : `projects_select_unified` interroge `access_requests`, et la policy d'insert sur `access_requests` interroge `projects` (pour vérifier `sensitivity_level`) — deux policies sur deux tables qui se référencent mutuellement en sous-requête directe déclenchent `42P17 infinite recursion detected in policy`. Fix : passer par des fonctions `SECURITY DEFINER` (`project_is_sensible()`, `has_other_approved_access_request()`) qui bypassent RLS, exactement comme `get_my_role()` le fait déjà pour `user_profiles`. Ne jamais remettre une sous-requête brute inter-tables dans une policy ici sans repasser par ce pattern.

Back-office admin (`AdminPage.tsx`, onglet Demandes + dashboard) branché sur les vraies fonctions `src/data/accessRequests.ts` (`getAllAccessRequests`/`approveAccessRequest`/`rejectAccessRequest`) — le mock `seedRequests`/`src/data/requests.ts` a été supprimé, ne plus le chercher.

F-11 — auto-approbation par projet dans `AccessRequestModal.tsx` (`handleSubmit`) : si le projet demandé est `sensitivity_level = 'sensible'` et que le visiteur a déjà au moins une autre demande `approved` sur un projet différent, la nouvelle ligne est insérée directement en `status: 'approved'` (skip la revue admin). Les projets `tres_sensible` passent toujours en revue.

`AccessRequestModal.tsx` fait un vrai travail, plus un mock :
- Visiteur **anon** : formulaire complet (nom/entreprise/email/mdp) → `supabase.auth.signUp()` + update `user_profiles` + insert `access_requests`.
- Visiteur **déjà connecté** (ex. persona `pending` qui redemande un autre projet) : les champs de compte sont masqués, insertion directe dans `access_requests` avec la session existante — **ne jamais rappeler `signUp()` si une session existe déjà**, sinon échec ("email déjà utilisé").
- Confirmation email désactivée sur le projet Supabase live (`rctedezgdxadmkjeawsj`, dashboard Authentication → Providers → Email) pour que `signUp()` renvoie une session immédiate — sans ça, l'insert `access_requests` échoue (RLS, pas de session).
- Modal montée via `createPortal(document.body)` (couvre nav/footer), scroll unique interne, body de page bloqué (`overflow:hidden`) tant qu'ouverte.

Composants/helpers partagés à réutiliser (ne pas dupliquer) : `Alert` (`src/components/Alert.tsx`, 4 types info/success/warning/error), `Checkbox` (`src/components/Checkbox.tsx`, circulaire), `textLinkClass()` (`src/lib/linkStyles.ts`, style de lien unifié), `formatSecteur()` (`src/lib/secteurLabels.ts`, mapping enum → libellé).

`PersonaSwitcher.tsx` (dev-only, `import.meta.env.DEV`) a été refait en bouton "⚡ Personas" + drop-up (au lieu d'un panneau toujours ouvert) — ne pas l'exposer en prod.

## Iconographie — Lucide uniquement

`lucide-react` est la seule librairie d'icônes du projet (migration complète depuis `material-symbols-outlined`, 09/07). Ne jamais réintroduire Material Symbols ou une autre lib. Icônes dynamiques (mapping état → icône) : typer en `LucideIcon`, assigner le composant directement plutôt qu'une chaîne — voir `StatusBadge.tsx`/`ThemeToggle.tsx`/`Alert.tsx`.

## Reste à faire (prochaine session — week-end)

**Migrations Supabase — rattrapées le 10/07** : `supabase/migrations/` ne remontait qu'au 06/07 alors que le projet Supabase live (`rctedezgdxadmkjeawsj`) est créé le 22/06 — avant même le premier commit git (03/07, messages génériques "Changes"/"Work in progress" typiques d'auto-commits Lovable). 6 migrations historiques (24/06 → 09/07, fondation RLS/triggers, seeds de démo, masquage colonnes vue catalogue) plus les 2 migrations RLS de cette session ont été récupérées via `supabase_migrations.schema_migrations.statements` et versionnées à l'identique du live (vérifié par comparaison directe, ex. `pg_get_viewdef()`). 3 migrations intermédiaires ignorées volontairement car entièrement remplacées par une version plus récente (aucune perte). Écart mineur restant, non résolu : les 2 fichiers locaux du 06/07 (`20260706125303`/`125315`) n'apparaissent pas dans `supabase_migrations.schema_migrations` — origine non investiguée.

**⚠️ Piège `security_invoker` sur les vues** : `CREATE OR REPLACE VIEW` ne préserve **pas** l'option `security_invoker = true` si elle n'est pas re-précisée dans la nouvelle définition — elle retombe silencieusement en mode `SECURITY DEFINER` implicite (bypass RLS). C'est exactement ce qui est arrivé à `projects_catalog_view` : créée avec `security_invoker = true` dans `audit_corrections_v2_0`, puis perdue au fil des `CREATE OR REPLACE VIEW` successifs (masquage colonnes, etc.) sans que personne ne le remarque. Conséquence vérifiée en direct le 10/07 : les projets `status='draft'` étaient visibles par n'importe quel visiteur anonyme via l'API. Corrigé par `alter view ... set (security_invoker = true)`. **Règle à appliquer désormais** : toute vue qui doit respecter la RLS des tables sous-jacentes doit soit passer par `ALTER VIEW ... SET (security_invoker = true)` après un `CREATE OR REPLACE VIEW`, soit repréciser l'option dans le `CREATE VIEW` lui-même. Vérifier après coup avec `select reloptions from pg_class where relname = '...'` (`null` = mode dangereux par défaut). Au passage, `designer_public_profile` (même alerte, vue jamais utilisée dans le code, absente du PRD) a été supprimée plutôt que corrigée.

**Mapping complet du LIGHT mode** — c'est LA tâche restante, reportée explicitement par l'utilisateur le 08/07.

- Constat : le bloc `:root:not(.dark)` de `src/styles.css` ne redéfinit que `background/surface*/outline/outline-variant/aurora/border-glass`. **Les 8 tokens de marque (primary, secondary, tertiary + leurs variantes container/on-container) héritent silencieusement des valeurs dark en light** → 0/8 définis en light, rendu non conforme.
- Valeurs cibles : colonnes **Light** de `DESIGN.md` (teal, secondary, tertiary, erreur, tags, fixed roles). Méthodologie identique au dark : token par token vs DESIGN.md, corriger, vérifier les ratios AA.
- **À inclure dans cette passe** : les bordures `border-white/X` (blanc semi-transparent) omniprésentes dans l'app sont quasi invisibles sur fond clair → à remplacer par une couleur de bordure adaptée au light (probablement `outline` per DESIGN.md, qui passe le seuil 3:1 dans les deux thèmes).

### ⚠️ Divergence connue à trancher pendant la passe light
Le token `secondary` vaut `#7c3aed` dans `src/styles.css` (bloc base/dark) alors que `DESIGN.md` liste `#D2BBFF` en dark. À arbitrer lors de la passe secondary/light — **ne pas corriger à l'aveugle**, décider avec l'utilisateur quelle valeur fait foi.

## Autres notes de session

- **Hydration dark/light corrigé** : `<html>` ne porte plus de `className` géré par React — depuis la migration React Router, `index.html` est un fichier statique et React ne fait plus aucune hydratation SSR (pure CSR, `createRoot(...).render(...)` dans `src/main.tsx`). Le script inline `THEME_INIT` dans le `<head>` de `index.html` a l'entière responsabilité de la classe `dark`/`light` sur `<html>`, appliquée avant tout rendu React. Règle produit : défaut = préférence système (`matchMedia`), pas de dark forcé. Logique miroir côté React dans `src/components/ThemeToggle.tsx` (`readStoredMode`).
- **Warning hydration `data-tsd-source` obsolète** : ce warning (attribut injecté par un plugin de dev tooling Lovable différant entre rendu serveur/client) était spécifique à l'ancienne architecture SSR TanStack Start. Depuis le passage en SPA pure (plus de rendu serveur du tout), il ne peut plus se produire — non revérifié explicitement mais structurellement impossible désormais.
