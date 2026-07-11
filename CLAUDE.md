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

**Contradiction DESIGN.md tranchée et corrigée (11/07)** : la section "🎫 Badges de statut d'accès (F-12)" (pastilles neutres) était obsolète par rapport à la section "🔔 Système d'alertes" — l'implémentation retenue et validée utilise bien le composant `Alert` coloré (info pour pending, warning pour refused). `DESIGN.md` a été corrigé pour matcher `ProjectCard.tsx` (vérifié ligne par ligne) — ne plus chercher l'ancienne version "pastilles".

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

**Trois bugs trouvés et corrigés le 11/07 en testant le flux F-12 en conditions réelles** (comptes réels, pas seulement les personas) :

1. **Demandes qui restaient affichées "Demander l'accès" après envoi réussi** — `CataloguePage.tsx` ne rechargeait `myRequests` qu'au montage ; rien ne le redéclenchait après un insert réussi dans `AccessRequestModal`. Fix : `AccessRequestModal` accepte un prop `onSuccess`, appelé juste après l'insertion, que `CataloguePage` branche sur un `refreshMyRequests` qu'elle passe en `useCallback`.
2. **`refreshMyRequests` court-circuitait sur un `session` périmé** — la version initiale du fix ci-dessus gardait `if (!session) return` dans `refreshMyRequests`, avec `session` capturé en closure React. Pour une **inscription anonyme** (visiteur qui crée son compte dans la modale), cette closure reste figée sur `session = null` — capturée au moment où la modale s'est ouverte, anonyme — même après l'inscription réussie, donc `onSuccess()` appelait une version périmée qui vidait `myRequests` au lieu de le recharger. `getMyAccessRequests()` (`src/data/accessRequests.ts`) n'a en réalité besoin d'aucun `session` : il interroge le client Supabase global, toujours à jour côté RLS. **Piège à retenir** : ne jamais gater une fonction passée en callback à un enfant sur un état React capturé en closure si cet enfant peut l'appeler après un changement d'auth asynchrone (signUp) survenu **pendant** sa propre exécution — la closure ne se "rafraîchit" pas au milieu d'un `async function` déjà lancé.
3. **Connexion via `/auth` invisible pour tout non-admin** — `AuthPage.tsx` redirigeait systématiquement vers `/admin` après connexion réussie ; `AdminPage.tsx` (garde `role !== "admin" → navigate("/")`) renvoyait alors silencieusement vers l'accueil quiconque n'est pas admin, donnant l'impression que la connexion avait échoué (aucune erreur, juste retour à la case départ). Fix : `AuthPage` récupère le rôle réel après connexion et route en conséquence (`admin` → `/admin`, sinon → le catalogue, où l'état des demandes est visible immédiatement).
4. **Demandes en double sur un même projet** — la modale listait *tous* les projets confidentiels comme cases à cocher, y compris ceux déjà demandés par le visiteur connecté (seule la carte `ProjectCard` elle-même était gatée). Un visiteur ouvrant la modale depuis un *autre* projet pouvait donc cocher un projet déjà en `pending`, créant une 2e ligne `access_requests` pour la même paire (visiteur, projet). Fix double : `CataloguePage` passe `excludeProjectIds` (dérivé de `myRequests`) à la modale qui filtre son checklist, **et** un index unique partiel en base (`access_requests_one_pending_per_user_project`, migration `20260711032500`) empêche deux lignes `pending` simultanées pour la même paire — une nouvelle demande reste possible une fois la précédente résolue (approuvée/refusée).

## Webhooks Supabase → Resend (PRD 7.3) — 4 webhooks, implémentés le 11/07

Infrastructure **Database Webhooks** construite entièrement en SQL (pas de configuration dashboard) : extension `pg_net` + une fonction trigger générique `public.dispatch_webhook()` (`supabase/migrations/20260711020351_...`) qui relaie tout INSERT/UPDATE vers une Edge Function, avec le payload standard `{type, table, record, old_record}`. Le nom de l'Edge Function cible est passé en argument du trigger (`TG_ARGV[0]`), donc **un seul trigger générique pour les 4 webhooks** plutôt que 4 fonctions trigger dupliquées.

Authentification du trigger → Edge Function : clé publique (`sb_publishable_...`) en dur dans la fonction Postgres — safe, c'est la même clé déjà exposée côté client, aucun secret à protéger ici. Chaque Edge Function (`verify_jwt: true`) interroge ensuite la base en `service_role` (`SUPABASE_SERVICE_ROLE_KEY`, injecté automatiquement par Supabase pour toute Edge Function — pas besoin de le configurer) pour résoudre les emails/noms/titres nécessaires au template.

**Les 4 webhooks** (`supabase/functions/webhook-*/index.ts`, triggers dans `20260711020735_...`) :
1. `trg_webhook_welcome_email` — INSERT `user_profiles` → email "Bienvenue" au nouvel inscrit.
2. `trg_webhook_access_request_created` — INSERT `access_requests` → email visiteur ("Demande en cours") + email à chaque admin ("Nouvelle demande").
3. `trg_webhook_access_request_updated` — UPDATE `access_requests` **seulement** sur la transition `pending → approved`/`rejected` (`WHEN` clause du trigger) → email visiteur "Accès accordé" ou "Refusé" + raison si présente.
4. `trg_webhook_contact_created` — INSERT `contacts` → email de confirmation au visiteur + notification à chaque admin.

**⚠️ Piège Resend sans domaine vérifié** : Resend refuse (`403 restricted_api_key`... non, `403 validation_error`) l'envoi vers une adresse `+alias` tant qu'aucun domaine n'est vérifié sur le compte — il fait une comparaison **stricte de chaîne** avec l'adresse exacte du compte Resend, sans awareness du `+tag` Gmail (testé en direct, pas supposé). Fix appliqué dans chaque Edge Function : `normalizeGmail()` strip le `+tag` avant l'appel Resend, **uniquement** pour `gmail.com`/`googlemail.com` (comportement correct même en prod, puisque c'est réellement la même boîte pour ces domaines — ne pas étendre à d'autres domaines où `+` n'est pas forcément un alias).

**⚠️ Clé API Resend "Sending access" uniquement** : la clé configurée (secret Edge Functions `RESEND_API_KEY`) a été créée avec la permission "Sending access", pas "Full access" — elle peut `POST /emails` mais `GET /emails/{id}` renvoie `401 restricted_api_key`. Conséquence : impossible de vérifier via l'API si un email a réellement été *délivré* (vs juste accepté par Resend), seulement que Resend l'a accepté pour envoi. À changer pour "Full access" si un vrai diagnostic de délivrabilité est nécessaire un jour.

**Domaine non vérifié = déclarativement du mode test** : tous les emails partent actuellement de `onboarding@resend.dev` (domaine partagé Resend, faible réputation, forte proba spam côté Gmail). Vérifier un domaine réel chez Resend est un prérequis avant toute mise en prod — pas juste pour lever la restriction `+alias` des tests.

Testé de bout en bout (SQL réel déclenchant les triggers, pas d'appel direct aux Edge Functions) pour les 6 emails + la variante refusé du webhook 3 — tous acceptés par Resend (`200`, id de message), 0 échec silencieux détecté dans les logs `net._http_response`/Edge Functions.

## Comptes de test — emails réels (migration 11/07)

Les personas de test (Sophie, Karim, Léa) et les comptes de démo supplémentaires (Jean, Sandra) sont passés d'adresses fictives sur un domaine non contrôlé (`@folioplus.app`, `@app.com`) à de vraies adresses Gmail avec alias `+` (`enoraleturnier+sophie-persona@gmail.com`, etc.) — **règle permanente : ne plus jamais utiliser d'adresse inventée sur un domaine non contrôlé pour des comptes de test**, Resend (et tout futur provider d'email transactionnel) doit pouvoir réellement délivrer aux comptes de démo.

Changement fait via **`auth.admin.updateUserById`** (script `scripts/update-persona-emails.mjs`), jamais de SQL brut sur `auth.users` — évite de désynchroniser `auth.identities`. `public.user_profiles.email` a été resynchronisé manuellement à la suite (n'est **pas** mis à jour automatiquement par Supabase quand l'email change côté `auth.users` — seul `handle_new_user()` le renseigne, une seule fois, à l'inscription). UUID vérifiés identiques avant/après, `access_requests`/`contacts` existants toujours liés correctement.

**⚠️ `PersonaSwitcher.tsx` a des emails en dur** (`PERSONAS` array) — si les comptes de test sont renommés à nouveau, penser à mettre à jour ce fichier en même temps, sinon le sélecteur échoue silencieusement (`signInWithPassword` avec une adresse qui n'existe plus).

Scripts d'admin réutilisables ajoutés dans `scripts/` (tous lisent `SUPABASE_SERVICE_ROLE_KEY` depuis `.env.admin`, gitignored, jamais commité) : `update-persona-emails.mjs`, `delete-auth-user.mjs` (suppression propre d'un compte de test : `access_requests`/`user_profiles` en SQL + `auth.admin.deleteUser` — **la suppression via l'API Admin ne cascade pas** `user_profiles`, à supprimer manuellement), `test-webhook-welcome.mjs`/`cleanup-webhook-test-user.mjs` (test end-to-end du webhook 1).

## Iconographie — Lucide uniquement

`lucide-react` est la seule librairie d'icônes du projet (migration complète depuis `material-symbols-outlined`, 09/07). Ne jamais réintroduire Material Symbols ou une autre lib. Icônes dynamiques (mapping état → icône) : typer en `LucideIcon`, assigner le composant directement plutôt qu'une chaîne — voir `StatusBadge.tsx`/`ThemeToggle.tsx`/`Alert.tsx`.

## Thumbnails projets — bucket Storage créé le 10/07

Le commentaire de `projects.thumbnail_url` dit "URL Supabase Storage" mais **aucun bucket n'existait** — les 4 projets démo pointent tous vers des URLs Google externes (`lh3.googleusercontent.com/aida-public/...`) non contrôlées par ce projet, donc potentiellement fragiles (pas de garantie de permanence). Créé `project-thumbnails` (bucket public, policies RLS : lecture publique, écriture réservée à `admin`). Pour uploader une image : Supabase Studio → Storage → `project-thumbnails`, puis coller l'URL publique générée dans `thumbnail_url`.

Ajouté aussi un filet de sécurité `onError` sur les deux `<img>` qui affichent `thumbnail_url` (`ProjectCard.tsx`, `ProjectDetailPage.tsx`) : avant, une image cassée/inaccessible ne s'effaçait pas, elle restait affichée en icône cassée sans aucune gestion. Désormais l'image se masque proprement (`display: none`) si elle ne charge pas.

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
