# Folio+ — Notes pour Claude Code

## Design system couleur — source de vérité

**`DESIGN.md`** (fourni par l'utilisateur, hors repo à `C:\Users\user24\Downloads\DESIGN.md` — à rapatrier dans le repo si besoin de le versionner) est la référence unique pour toutes les valeurs de couleur, la nomenclature M3, et les ratios WCAG/RGAA vérifiés. Toujours le consulter avant de toucher à `src/styles.css` ou d'ajouter un token couleur. Il a été mis à jour le 08/07 avec les valeurs dark corrigées ci-dessous.

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

## Reste à faire (prochaine session — week-end)

**Mapping complet du LIGHT mode** — c'est LA tâche restante, reportée explicitement par l'utilisateur le 08/07.

- Constat : le bloc `:root:not(.dark)` de `src/styles.css` ne redéfinit que `background/surface*/outline/outline-variant/aurora/border-glass`. **Les 8 tokens de marque (primary, secondary, tertiary + leurs variantes container/on-container) héritent silencieusement des valeurs dark en light** → 0/8 définis en light, rendu non conforme.
- Valeurs cibles : colonnes **Light** de `DESIGN.md` (teal, secondary, tertiary, erreur, tags, fixed roles). Méthodologie identique au dark : token par token vs DESIGN.md, corriger, vérifier les ratios AA.
- **À inclure dans cette passe** : les bordures `border-white/X` (blanc semi-transparent) omniprésentes dans l'app sont quasi invisibles sur fond clair → à remplacer par une couleur de bordure adaptée au light (probablement `outline` per DESIGN.md, qui passe le seuil 3:1 dans les deux thèmes).

### ⚠️ Divergence connue à trancher pendant la passe light
Le token `secondary` vaut `#7c3aed` dans `src/styles.css` (bloc base/dark) alors que `DESIGN.md` liste `#D2BBFF` en dark. À arbitrer lors de la passe secondary/light — **ne pas corriger à l'aveugle**, décider avec l'utilisateur quelle valeur fait foi.

## Autres notes de session

- **Hydration dark/light corrigé** : `<html>` ne porte plus de `className` géré par React dans `RootShell` (`src/routes/__root.tsx`) — c'est le script inline `THEME_INIT` qui en a l'entière responsabilité. Règle produit : défaut = préférence système (`matchMedia`), pas de dark forcé. Logique miroir côté React dans `src/components/ThemeToggle.tsx` (`readStoredMode`).
- **Warning hydration résiduel non lié au thème** : attribut `data-tsd-source` sur `<head>`, injecté par un plugin de dev tooling Lovable, diffère serveur/client. Pas un bug applicatif — ne pas chercher à le corriger sans consigne explicite.
