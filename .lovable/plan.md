## Folio+ — build plan (revised v7, client-side SPA)

Client-side SPA using **TanStack Router file-based routing only** (no SSR, no TanStack Start). All clarifications through v7 folded in.

### Stack

- TanStack **Router** (`@tanstack/react-router`) + file-based Vite plugin.
- React 19 + TypeScript + Tailwind v4.
- `src/main.tsx` mounts `<RouterProvider router={router} />` into `#root`; `index.html` owns head (fonts, Material Symbols, meta, theme pre-hydration script).
- Strip TanStack Start surface (`src/server.ts`, `src/start.ts`, `HeadContent`/`Scripts`, shellComponent, `?url` CSS import). `__root.tsx` becomes a plain layout returning `<Outlet />` + providers. CSS imported normally in `main.tsx`.
- 404 via `notFoundComponent` on `__root`.
- No DB, auth, server functions, real Cal.com, star-field JS.

### Routes (`src/routes/`)

```
__root.tsx                dark class + localStorage, providers, <Outlet/>, 404. NO aurora.
index.tsx                 redirect → /lea-martin  (+ TODO comment)
$slug.tsx                 layout: <Header role="visitor"/> + <Outlet/> + Footer
$slug.index.tsx           public profile — renders <AuroraBackground/>
$slug.projects.index.tsx  catalogue + filters — renders <AuroraBackground/>
$slug.projects.$id.tsx    project detail — plain bg-background, NO aurora
admin.tsx                 admin dashboard — <Header role="admin"/>, NO aurora, NO guard
```

Verbatim comments:
- `index.tsx`: `// TODO: replace with dynamic slug from Supabase auth at step 2`
- `admin.tsx` top: `// TODO: add Supabase session guard at step 2 — redirect to /login if no active session`

### Header — role rules (V1 mock)

`<Header role="anon" | "visitor" | "admin" />`. Rendering rules:
- **`/admin`** routes → always `admin`.
- **`/[slug]`** routes (profile, catalogue, project detail) → always `visitor`.
- **Anon** → default on public pages when no session exists (reserved for future public entry points; not rendered anywhere in V1's mock routes, but the variant exists in the component).

**Admin dropdown — exactly 3 entries, in order:**
1. "Accéder au dashboard" → `<Link to="/admin">`
2. "Paramètres" → `<Link to="/admin" search={{ tab: "parametres" }}>` — Admin page reads `useSearch()` to auto-select the Paramètres tab
3. "Se déconnecter" — destructive red styling, no-op stub in V1

### Head / fonts

Title, description, OG/Twitter meta, and font `<link>` tags (Outfit, Cormorant Garamond italic, Material Symbols) in `index.html`. No per-route `head()` in V1.

### Design tokens (`src/styles.css`)

Full `DESIGN.md` palette under `@theme inline`: `bg-surface-container`, `text-on-surface-variant`, `border-outline` (#859490), aurora/tag/status colors (info indigo, success green, slate, destructive red). Dark by default; `localStorage["folio-theme"]`; pre-hydration script in `index.html`. `prefers-reduced-motion` honored.

### Shared components (`src/components/`)

Header (3 roles, admin variant with the dropdown above), Footer, AuroraBackground (profile + catalogue only), TagBadge, StatusBadge, ProjectCard, ProjectDrawer, ContactForm, CalEmbed, AccessRequestModal, ThemeToggle, FilterBar.

- **ContactForm** — RGPD checkbox exact label: "J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la politique de confidentialité." `border border-outline` (#859490).
- **CalEmbed** — teal-bordered card, "Calendrier — Prendre un rendez-vous" + Cal.com step-2 subtitle. Returns `null` when `calUsername` is empty.
- **AccessRequestModal** — two entry points only: profile CTA + catalogue confidential teasers.

### Admin dashboard — 4 tabs

Left icon rail. Tabs: **Projets**, **Demandes d'accès**, **Contacts**, **Paramètres**. Active tab derived from `?tab=` search param so the header "Paramètres" link deep-links correctly.

- **Projets** — soft-delete: active rows show edit / delete / publish toggle; deleted rows dim to `opacity-35`, show "Supprimé" badge, single restore button (`aria-label="Restaurer le projet"`), publish toggle hidden. No duplicate action.
- **Demandes d'accès** — rows from `requests.ts` sorted date desc: requester, company, email, requested project titles, date, StatusBadge. Pending → "Valider" (primary) + "Refuser" (destructive, opens inline required rejection-reason input). Approved/rejected → badge only.
- **Contacts** — rows from `contacts.ts` sorted date desc: sender, email, 2-line clamped preview, date, StatusBadge (Nouveau indigo / Traité green / Archivé slate). Icon button cycles Nouveau → Traité → Archivé, `aria-label="Changer le statut du message"`.
- **Paramètres** — settings form: drag-and-drop avatar (preview hotlinked from `designer.ts`), bio textarea, LinkedIn / Twitter / Website URLs, `calUsername`, read-only `/[slug]` field with copy button (`aria-label="Copier le lien du profil"`), single "Enregistrer les modifications" primary button. Labels Sentence case + `htmlFor`. Local `useState`, no persistence.

### Mock data (`src/data/`, typed)

- `designer.ts` — Léa Martin, slug `lea-martin`, bio, avatar, socials, `calUsername`.
- `projects.ts` — 6 projects covering all four statuses (incl. one `deleted`), hotlinked image URLs.
- `requests.ts` — 3 access requests, one per status.
- `contacts.ts` — 3 messages, one per status.

### Accessibility

`<html lang="fr">`, `aria-hidden="true"` on decorative icons, `focus-visible:ring-2`, French `aria-label`s, `role="switch" aria-checked` on toggles, `prefers-reduced-motion` honored.

### Out of scope

No SSR / TanStack Start, no DB, no auth, no server functions, no real Cal.com, no star-field JS, no non-`rounded-full` on buttons/tags/badges, no fonts beyond Outfit + Cormorant Garamond, no local image imports, no duplicate action, no hard delete, no slug editing.

Approve to build.