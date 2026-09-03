# Folio+ — Design System (Dark + Light)

Document de référence **unique** pour l'implémentation des tokens couleur dans Claude Code (Tailwind v4, `src/styles.css`, `:root` / `.dark`). Nomenclature Material 3. Tous les ratios sont vérifiés programmatiquement (WCAG 2.1), pas estimés.

**Dernière mise à jour** : 2 septembre 2026 — légende de galerie repassée en overlay **bas-droite** sur la photo (était un bloc statique sous l'image depuis la retouche précédente le même jour) ; le calcul de `row-span` par image (cf. juste en dessous) n'a alors plus besoin de réserver de budget de hauteur pour elle, l'image reprend 100% de sa cellule. Avant ça, même jour — galerie fiche projet : le `row-span` de chaque vignette n'est plus fixe par `size_variant` (qui forçait soit un recadrage `object-cover`, soit des bandes vides `object-contain`) mais **calculé par image** à partir de son vrai ratio (`naturalWidth`/`naturalHeight` au `onLoad`) et de la largeur réelle de sa cellule (mesurée via `ResizeObserver`, la galerie étant fluide/pleine largeur) — `size_variant` ne contrôle plus que la largeur (`SIZE_VARIANT_COL_SPAN`), la hauteur suit le ratio réel via une unité de grille très fine (`grid-auto-rows: 8px`) ; `object-cover` repris (le recadrage résiduel devient de l'ordre de quelques px, imperceptible). **Piège rencontré** : `grid-row: span N` n'a aucun effet cohérent sans que `grid-auto-rows` soit explicitement posé à la même unité (8px) — oublié une première fois, symptôme repéré en comparant ratio réel vs ratio rendu (`getBoundingClientRect`) plutôt qu'en se fiant au visuel seul. Voir section "🖼️ Fiche projet — hero parallax, flèche header, galerie grille + légendes" pour le détail complet (dérivation, clamp de ratio, les deux instances `ProjectGallery` mobile/desktop). Avant ça, même jour — **bug corrigé : `position: sticky` cassé site-wide** par `overflow-x: hidden` déclaré sur `body` en plus de `html` (fixup CSS overflow-x non-visible → overflow-y calcule à `auto` sur le même élément → `body` devenait un second conteneur de scroll aux yeux de `sticky`, qui s'y comportait comme `static`) — déplacé sur `html` seul (`styles.css`) ; seul usage de `sticky` du codebase (l'aside de `ProjectDetailPage.tsx`) désormais réellement fonctionnel, vérifié par scroll réel + lecture de `rect.top` (pas juste `getComputedStyle`). Même passe : hero ramené à sa taille d'origine (`aspect-[3/1]`/`aspect-[4/3]`, un agrandissement à `aspect-[2/1]`/`aspect-square` tenté plus tôt dans la journée s'est avéré trop imposant) et espacement sous la navbar encore resserré (`mt-24`) ; images de galerie passées d'`object-cover` (recadrées) à `object-contain` (image entière toujours visible, fond `bg-surface-container-lowest` en letterboxing) — voir section "🖼️ Fiche projet — hero parallax, flèche header, galerie grille + légendes" pour le détail complet. Avant ça, même jour — espacement hero/navbar resserré (`mt-24` depuis `mt-32`), hero agrandi (`aspect-[2/1]`/`aspect-square`) et parallax accentué (`PARALLAX_FACTOR` 0.2→0.35, marge de débordement de l'image relevée en conséquence pour rester sans bord vide) ; galerie passée en pleine largeur de page (breakout `-mx-[50vw] w-screen`, hors de la contrainte `max-w-[1440px]` de `<main>`) et rangées agrandies (`auto-rows-[220px]`/`[280px]`) ; bloc d'info toujours sticky mais désormais rendu en deux dispositions distinctes mobile/desktop (`contentBlock`/`asideCard`/`gallerySection` calculés une fois, rendus deux fois) au lieu d'un simple `order` CSS, pour que la galerie devienne un sibling hors de la grille 2 colonnes et que le *containing block* du sticky s'arrête net à la fin du contenu. Avant ça, même jour — ajustements layout fiche projet : hero repositionné sous la navbar (`mt-32`, plus de "plein page dès le haut") sans dégradé, parallax recalculé via `getBoundingClientRect` pour rester robuste au décalage ; bloc d'informations projet passé à gauche (`order` CSS), réduit (`md:col-span-3` + `max-w-xs`) ; galerie : légende sortie de l'overlay vers un bloc statique sous chaque image, coins arrondis retirés, espacements resserrés (`gap-2`/`gap-3`) — voir section "🖼️ Fiche projet — hero parallax, flèche header, galerie grille + légendes" pour le détail. Avant ça, même jour — galerie d'images de la fiche projet : bascule du masonry CSS-columns vers une vraie grille CSS (`col-span`/`row-span` + `grid-flow-dense`, 5 tailles dont une inédite « portrait » 1×2), ajout d'une légende par image (toujours visible, overlay bas-gauche, pré-remplie depuis le nom de fichier) et d'une numérotation d'ordre dans le formulaire — voir section "🖼️ Fiche projet — hero parallax, flèche header, galerie grille + légendes" pour le détail (mapping des tailles, migration des 11 images déjà en base au moment de la bascule). Avant ça, 1er septembre 2026 — fiche projet (`ProjectDetailPage.tsx`) : hero plein écran avec effet parallax (premier transform JS continu piloté par le scroll de l'app), flèche retour intégrée au header au scroll (`Header.tsx`, troisième branchement par route après `isAdminRoute`), galerie d'images secondaires (nouvelle table `project_images`, bucket Storage `project-gallery`, gestion admin dans `ProjectDrawer.tsx`), y compris un piège Storage RLS découvert et corrigé en vérifiant le flux en conditions réelles (documenté dans `CLAUDE.md`). Avant ça, 28 août 2026 — retouche du tiroir burger (`BurgerMenu`, cf. section "Navigation mobile") : fond glass façon `.glass-card` (au lieu du fond neutre uni d'origine) + entrée "bouncy" (scale + easing overshoot, `SlideSheet` props `panelClassName`/`bouncy`/`zIndexClassName`) ; bouton de fermeture `X` dédié retiré, le tiroir passe sous le header (`z-40`) pour que le bouton hamburger→croix du header reste le seul contrôle ouvrir/fermer, visible au même endroit. Juste avant, même jour : refonte menu Folio+ (header desktop, header/drawer mobile) — voir bloc "Refonte menu Folio+ (28/08)" pour le détail complet (hamburger→croix CSS, tiroir plein écran, nom du designer en accent italique `primary-container`, header desktop transparent→fond au scroll). Avant ça, 27 août 2026 — fond Aurora (section dédiée plus bas) refondu en shader WebGL "Soft Aurora" (composant installé depuis reactbits.dev, dépendance `ogl`), étendu à 4 couleurs, remplace l'ancien fond CSS partout ; désactivé sous 768px et `prefers-reduced-motion`. Juste avant, même jour : police d'accent (`--font-display-accent`, section Typographie) remplacée de Cormorant Garamond vers Lora (italic 500 conservé) ; testée d'abord isolément sur la page Profil (`.font-accent-test`) avant généralisation à toute l'app une fois validée. Avant ça, 17 juillet 2026 : refonte navigation mobile (`< md`, 768px) : header mobile commun pages publiques/dashboard admin (burger + thème + compte), primitive `SlideSheet` (feuilles plein écran bas / tiroir gauche), `MobileThemeSheet`/`MobileAccountSheet` remplaçant les dropdowns desktop, `MobileNotificationsView` branchée sur la table `notifications` existante, `AdminMobileBottomNav` (5 entrées) remplaçant la sidebar admin sur mobile — voir section dédiée plus bas. Convention actée : toute retouche visuelle mobile ne s'applique jamais au desktop par défaut (dupliquer le JSX `md:hidden`/`hidden md:flex` si la mise en page diffère structurellement). Avant ça, 13 juillet : onglet "Veille Design Hebdo" renommé "Veille Hebdo" ; couleurs de nav active + badges de notification redéfinies par section (`NAV_ACTIVE_CLASSES`, dashboard admin) : fuchsia (Catalogue projets), tertiary-container plein (Messages), neutre `surface-container` (Paramètres) — voir table dédiée plus bas, halos `SectionAurora` volontairement laissés inchangés (dissociés de la nav désormais). Juste avant : amélioration du sidebar admin (fusion "Dashboard" dans la nav, tooltip custom en mode icône-seule, survol avec fond, badge `text-[10px]`, état replié persisté) + deux règles globales `styles.css` (`cursor: pointer` systématique, icônes Lucide uniformisées à `stroke-width: 1.5`, plus d'exception 2px sous 16px). Voir les sections dédiées plus bas. Avant ça, 12 juillet : passe de finitions UI (branche `style/ux-ui-ameliorations`) : badges et boutons resserrés, titres de page harmonisés, modales de confirmation standardisées (icône + fond boréal + ombre), fonds boréals différenciés par page/section admin, accent italique du dashboard admin agrandi au-delà du titre (retouche demandée après coup), puis deux passes successives de renforcement du fond aurora (alphas remontés à plusieurs reprises, 4ᵉ couleur indigo ajoutée à la composition principale, variant modal avec ses propres alphas plus marqués) ; en parallèle sur `main` : ajout des sections "États d'erreur de formulaire" et "Badge de statut avec suffixe". Avant ça : section badges d'accès F-12 corrigée (11/07). Reste : dark mode conforme AA + système de filtres, badges d'accès et alertes.
**Fond dark de référence officiel** : `#0E1513` (remplace `#050507`, obsolète).
**Fond light de référence** : `#F9FBFA`.

> ⚠️ Si d'autres fichiers `DESIGN.md` / `DESIGN_dark.md` / `DESIGN_light.md` traînent : **celui-ci fait foi**.

---

## ⚠️ Règle de mapping M3 — à ne jamais casser

Le rôle `primary` **n'est pas** la couleur de bouton. C'est `primary-container` qui porte les CTA et l'UI visible. Inversion volontaire par rapport aux exemples M3 génériques et à la convention shadcn par défaut.

| Rôle | Usage | Dark | Light |
|---|---|---|---|
| `primary` | Icônes et accents à fort contraste — **jamais un fill de bouton** | `#57F1DB` | `#085C50` |
| `primary-container` | Couleur de marque visible — boutons, CTA, états actifs | `#2DD4BF` | `#0A7A6A` |

**Règles d'usage validées :**
- **Boutons / CTA** : `bg-primary-container` + `text-on-primary-container`.
- **Éléments décoratifs** (avatars à initiales, cercles d'icônes non cliquables) : fond `on-primary` (`#003731` dark) + contenu `text-primary` (`#57F1DB` dark). Distingue visuellement du bouton CTA (ratio 9.44:1). Ne **pas** utiliser `primary-container` pour ces éléments.
- **Ne jamais** poser une icône `primary` directement sur un fond `primary-container` (contraste 1.51:1 en light). Utiliser `on-primary-container` dans ce cas.

---

## 🎨 Fond & texte de base

| Token | Dark | Light | Ratio light (vs surface) | Statut |
|---|---|---|---|---|
| `surface` / `background` | `#0E1513` | `#F9FBFA` | — | référence |
| `surface-dim` | `#0E1513` | `#DCE0DF` | — | — |
| `surface-bright` | `#333B38` | `#FBFBFB` | — | — |
| `surface-container-lowest` | `#09100E` | `#FFFFFF` | — | — |
| `surface-container-low` | `#161D1B` | `#F4F5F5` | — | — |
| `surface-container` | `#1A211F` | `#EFF1F0` | — | — |
| `surface-container-high` | `#242B29` | `#E9ECEB` | — | — |
| `surface-container-highest` | `#2F3634` | `#E4E7E6` | — | — |
| `on-surface` | `#DDE4E0` | `#171C19` | 16.61:1 | ✅ AAA |
| `on-surface-variant` | `#BACAC5` | `#425750` | dark 10.87 · light 7.45 | ✅ AAA |
| `outline` | `#859490` | `#72827E` | dark 5.84 · light 3.88 | ✅ AA (seuil UI 3:1) |
| `outline-variant` | `#3C4A46` | `#C7D1CE` | 1.50:1 | ⚠️ FAIL — voir règle |
| `inverse-surface` | `#DDE4E0` | `#0E1513` | — | réutilise l'autre thème (M3) |
| `inverse-on-surface` | `#2B3230` | `#DDE4E0` | — | réutilise l'autre thème (M3) |
| `surface-variant` | `#2F3634` | `#E4E7E6` | — | — |

### ⚠️ `outline-variant` — restriction d'usage (dark ET light)

Échoue l'AA dès qu'il porte une bordure porteuse de sens (seuil non-text 3:1). Réservé aux séparateurs décoratifs. Pour toute bordure fonctionnelle → `outline`.

> Règle globale `* { border-color: var(--outline-variant) }` dans `styles.css`. Audit 9/07 : aucune bordure fonctionnelle applicative ne s'appuie sur cet héritage implicite. Filet de sécurité inoffensif.

---

## 🎨 Teal (marque)

| Token | Dark | Light | Ratio | Statut |
|---|---|---|---|---|
| `primary` (icônes/accents) | `#57F1DB` | `#085C50` | dark 13.22 · light 7.61 | ✅ AAA |
| `on-primary` | `#003731` | `#FFFFFF` | — | fond déco (dark) / texte (light) |
| `primary-container` (CTA) | `#2DD4BF` | `#0A7A6A` | dark 9.94 · light 5.05 | ✅ AA+ |
| `on-primary-container` | `#00201C` | `#FAFFFE` | dark 9.22 · light 5.19 | ✅ AA+ |
| `inverse-primary` | `#006B5F` | `#57F1DB` | — | réutilise l'autre thème |
| `surface-tint` | `#3CDDC7` | `#0A7A6A` | — | — |

> `on-primary-container` dark corrigé 9/07 : `#00574D` (4.57, limite) → `#00201C` (9.22).

---

## 🎨 Secondary (violet système M3)

| Token | Dark | Light | Ratio | Statut |
|---|---|---|---|---|
| `secondary` | `#D2BBFF` ⚠️ | `#4500CC` | light 9.51 | voir note |
| `on-secondary` | `#3F008E` | `#FCFAFF` | — | — |
| `secondary-container` | `#6001D1` | `#E3CCFF` | — | fond de badge |
| `on-secondary-container` | `#EADDFF` | `#1A004C` | dark 6.72 · light 12.49 | ✅ AA+ |

> **Divergence connue à trancher** : token `secondary` = `#7c3aed` dans le code, cible M3 dark = `#D2BBFF`. À arbitrer lors de la passe light. Le badge `confidential` (StatusBadge) utilise `secondary` (`#7c3aed`) en fill `/80` — conforme AA (5.79), conservé volontairement.
> `on-secondary-container` dark corrigé 9/07 : `#C9AEFF` (4.53) → `#EADDFF` (6.72).

---

## 🎨 Tertiary (indigo système M3)

| Token | Dark | Light | Ratio | Statut |
|---|---|---|---|---|
| `tertiary` | `#D9D6FF` | `#1000D6` | dark 13.22 · light 10.15 | ✅ AAA |
| `on-tertiary` | `#1D00A5` | `#FBFAFF` | — | — |
| `tertiary-container` | `#B9B7FF` | `#CDCCFF` | — | fond de badge |
| `on-tertiary-container` | `#130E43` | `#130E43` | dark 9.63 | ✅ AAA |

> `tertiary-container` / `on-tertiary-container` ajoutés en dark 9/07 (étaient absents).

---

## 🎨 Erreur

| Token | Dark | Light | Ratio | Statut |
|---|---|---|---|---|
| `error` | `#FFB4AB` | `#CC1600` | dark 10.89 (vs surface) · light 5.51 | ✅ AA+ |
| `on-error` | `#690005` | `#FFFAFA` | — | — |
| `error-container` | `#93000A` | `#FFCCCF` | — | fond de badge |
| `on-error-container` | `#FFDAD6` | `#520800` | dark 7.24 · light 10.61 | ✅ AA+ |

---

## 🎨 Warning (nouveau — ajouté pour le système d'alertes)

Aucun équivalent n'existait dans la palette avant cette session. Seule vraie nouvelle couleur introduite (tout le reste du design system réutilise des tokens existants).

| Token | Dark | Light | Ratio dark | Statut |
|---|---|---|---|---|
| `warning` | `#FBBF24` | ⏳ à calculer (passe light) | 11.08 (vs surface) · 8.18 (texte sur tint 15%) | ✅ AAA |

**Usage** : composant Alert type "avertissement" uniquement. Structure identique aux autres types d'alerte (voir section Alertes).

---

## 🎨 Fixed roles (identiques dans les deux thèmes — convention M3, ne pas dupliquer)

| Token | Valeur | Token | Valeur |
|---|---|---|---|
| `primary-fixed` | `#62FAE3` | `secondary-fixed` | `#EADDFF` |
| `primary-fixed-dim` | `#3CDDC7` | `secondary-fixed-dim` | `#D2BBFF` |
| `on-primary-fixed` | `#00201C` | `on-secondary-fixed` | `#25005A` |
| `on-primary-fixed-variant` | `#005047` | `on-secondary-fixed-variant` | `#5A00C6` |
| `tertiary-fixed` | `#E2DFFF` | `on-tertiary-fixed` | `#0F0069` |
| `tertiary-fixed-dim` | `#C3C0FF` | `on-tertiary-fixed-variant` | `#3323CC` |

---

## 🏷️ Tags catégories — réutilisés pour les filtres du catalogue

| Catégorie | Dark | Light | Ratio | Statut |
|---|---|---|---|---|
| fuchsia | `#D946EF` | `#7C0C8D` | dark 4.59 (texte sur tint 15%) · light 8.81 | ✅ AA |
| cyan | `#06B6D4` | `#046F81` | dark 6.03 (tint 15%) · light 5.62 | ✅ AA |
| sky | `#0EA5E9` | `#096690` | dark 5.37 (tint 15%) · light 6.10 | ✅ AA |
| indigo | `#818CF8` | `#3E4FF4` | dark 5.03 (tint 15%) · light 5.57 | ✅ AA |

**Mapping catégorie de filtre → couleur (validé 9/07)** :
- Filtre TYPE → fuchsia
- Filtre SECTEUR → cyan
- Filtre OUTILS → sky
- Filtre MOTS-CLÉS → indigo

Chaque **catégorie** a sa couleur — pas chaque valeur individuelle à l'intérieur (les 7 types de projet ne sont pas 7 couleurs différentes, ils partagent tous le fuchsia de la catégorie TYPE).

---

## 🔒 Violet confidentiel

| Token | Dark | Light | Statut |
|---|---|---|---|
| `violet-confidential` | `#7C3AED` | `#7C3AED` | ✅ |

**Usage** : badge 🔒 CONFIDENTIEL (classification du projet, toujours affiché sur anon/pending/rejected) et badge "Confidentiel · Accès validé" (validated_visitor/admin, icône `LockOpen` au lieu de `Lock`, **même style/fill que le badge original** — pas de nouvelle couleur).
- Dark : fill plein `#7C3AED` + texte **`white`** obligatoirement (5.7:1) — `on-surface` (4.41:1) échoue l'AA de justesse, à corriger si c'était le texte utilisé jusqu'ici.
- Light : 5.48:1 vs surface → OK texte et fill.
- Jamais comme texte générique ailleurs dans l'app.

---

## 🎯 Système de filtres (catalogue) — états vide / plein

**Taille & graisse** : `text-sm` (≈13px, en `rem`/classe Tailwind — jamais de `px` en dur, pour le zoom navigateur à 200%), `font-weight: 400` (pas de bold).

**État vide (non sélectionné)** — identique quelle que soit la catégorie :
- `border-outline` (jamais `outline-variant`)
- `text-on-surface-variant`
- fond transparent
- `rounded-full`

**État plein (sélectionné)** — couleur de la catégorie (voir mapping ci-dessus) :
- fond teinté 15% de la couleur catégorie (`bg-[couleur]/15`)
- bordure et texte dans cette couleur (`border-[couleur]/40`, `text-[couleur]`)
- Contrastes vérifiés AA (4.59 à 6.03:1 en dark)

**Hover (sur pill vide)** : bordure passe à la couleur de la catégorie (transition douce), avant sélection.

**Accessibilité obligatoire** :
- `focus-visible` avec `ring-2 ring-primary` (ou équivalent) sur chaque pill — exigence 8.3 PRD.
- La distinction vide/plein ne repose jamais sur la couleur seule : le changement de fond (transparent → teinté) porte l'info en plus de la couleur.
- Chaque catégorie a un label texte visible (TYPE, SECTEUR, OUTILS, MOTS-CLÉS) — la couleur est un renfort, pas le seul vecteur d'identification de catégorie.

**Toggle "Filtrer" (ouverture drawer)** :
- Repos : `border-outline`, pas de fond, `text-on-surface`, icône Lucide (`SlidersHorizontal`, round, 14px)
- Hover : `border-primary` + `bg-primary/5`, `text-primary`
- `focus-visible` obligatoire, même traitement que les pills

---

## 🏷️ Mapping `secteur_activite` — enum DB → libellé affiché

Les valeurs de l'enum sont techniques, jamais affichées telles quelles :

| Valeur DB | Libellé |
|---|---|
| `tech_saas` | Tech & SaaS |
| `ecommerce` | E-commerce |
| `finance_banque_assurance` | Finance & Assurance |
| `sante` | Santé |
| `education` | Éducation |
| `media_culture` | Média & Culture |
| `industrie_manufacturing` | Industrie |
| `retail_distribution` | Retail & Distribution |
| `immobilier` | Immobilier |
| `rh_recrutement` | RH & Recrutement |
| `transport_logistique` | Transport & Logistique |
| `tourisme_hotellerie` | Tourisme & Hôtellerie |
| `alimentation_restauration` | Alimentation & Restauration |
| `energie_environnement` | Énergie & Environnement |
| `sport_bien_etre` | Sport & Bien-être |
| `luxe_mode` | Luxe & Mode |
| `juridique_conseil` | Juridique & Conseil |
| `association_ngo` | Association / ONG |
| `entreprise_publique` | Entreprise publique |
| `startup` | Startup |
| `autre` | Autre |

---

## 🎫 États d'accès — carte projet confidentiel (F-12)

Section corrigée le 11/07 — l'ancienne version (pastilles neutres dédiées) contredisait la section "🔔 Système d'alertes" ci-dessous et ne correspondait plus à l'implémentation réelle. Vérifié directement dans `ProjectCard.tsx` : 4 états, gérés via la prop `accessState`.

**Hauteur de carte uniforme (12/07)** : titre (`h3`) et description courte (`p`) passés en `line-clamp-2` + `min-h-[3.5rem]`/`min-h-[2.5rem]` respectivement — toutes les cards du catalogue ont désormais la même hauteur de bloc titre+texte quelle que soit la longueur réelle du contenu, au lieu de cards de hauteurs inégales selon le texte.

| État | Visuel | Interaction |
|---|---|---|
| **none** (pas de demande) | Thumbnail flouté + icône `Lock` en overlay. CTA plein `bg-primary-container` + `text-on-primary-container`, `rounded-full`, icône `KeyRound`, texte "Demander l'accès" | Carte entière cliquable → ouvre `AccessRequestModal`. |
| **pending** | Thumbnail flouté + icône `Loader2` animée (rotation CSS) en overlay. Composant `Alert` type `info` : "Demande en cours de traitement" | Carte inerte — pas de curseur pointer, pas de hover. |
| **refused** | Thumbnail flouté + icône `Lock` en overlay. Composant `Alert` type `warning` : motif du refus + lien "Contacter l'administrateur ?" vers la section contact de `/[slug]` | Carte inerte. Seul le lien "Contacter" a un état hover (soulignement), isolé du reste. |
| **granted** | Thumbnail net (pas de flou). Badge "Confidentiel · Accès validé" — fill plein `violet-confidential` + texte `white`, icône `LockOpen` | Carte = lien direct vers la fiche complète, pas de demande d'accès. |

Le badge 🔒 CONFIDENTIEL (classification, `StatusBadge kind="confidential"`) est **distinct** du badge de statut d'accès ci-dessus — il reste affiché sur none/pending/refused, remplacé uniquement par "Confidentiel · Accès validé" une fois l'accès obtenu.

Pas de pastille dédiée pour pending/refused : ces deux états réutilisent le composant `Alert` générique (voir section suivante), cohérent avec le reste de l'app plutôt qu'un style propre à cette carte.

---

## 🏷️ Badges (StatusBadge / TagBadge / puces `TagPicker`) — taille & graisse

Resserrés le 12/07 (passe de finitions UI) — trop imposants par rapport au reste des composants pill (filtres, tags) qui étaient déjà en `text-sm font-normal`.

| Composant | Avant | Après |
|---|---|---|
| `StatusBadge` | `px-4 py-1.5 text-[10px] font-bold` | `px-3 py-1 text-[10px] font-normal` |
| `TagBadge` | `px-3 py-1 text-[11px] font-medium` | `px-2.5 py-0.5 text-[10px] font-normal` |
| Puce sélectionnée `TagPicker` | `py-1 pl-3 pr-1.5 text-[11px] font-medium` | `py-0.5 pl-2.5 pr-1 text-[10px] font-normal` |
| Badges inline "Confidentiel • {sensibilité}" / "Confidentiel · Accès validé" (`ProjectCard`) | `px-4 py-1.5 text-[10px] font-bold` | `px-3 py-1 text-[10px] font-normal` |

**Règle** : `font-weight: 400` explicite (`font-normal`) sur tout badge — ne jamais se contenter de retirer `font-bold`, le poids hérité de `body` est 300 (trop léger, illisible en `text-[10px]`).

**Non concernés** (catégorie différente, déjà conforme) : les pills de `FilterBar` (déjà `text-sm font-normal` depuis la session filtres) et les petites pastilles de compte (badge de notification `h-5 w-5` sur la sidebar admin, compteur de filtres actifs) — ce sont des indicateurs numériques compacts, pas des étiquettes de statut/tag, réduire encore leur taille les rendrait illisibles.

**`ComingSoonBadge`** (15/07, `src/components/ComingSoonBadge.tsx`) — pastille "Bientôt disponible", rôle **info** (même token `tertiary` que l'alerte info, voir section suivante) pour signaler une fonctionnalité temporairement désactivée : `bg-tertiary/15 border-tertiary/40 text-tertiary`, icône `Flame`, même gabarit que les autres badges (`px-3 py-1 text-[10px] font-normal uppercase tracking-widest rounded-full`, cf. `StatusBadge`). **Règle confirmée 15/07** : tout badge de statut (pas les tags libres type `TagBadge`) est obligatoirement en capitales — `uppercase tracking-widest` systématique. Contraste texte `tertiary` sur fond `tertiary/15` (dark) ≈ **9.28:1** (calculé par blend alpha sur `#0E1513`, au-delà du seuil AAA) — cohérent avec la méthode "état plein" déjà en place (section Filtres, `bg-[couleur]/15` + `border-[couleur]/40` + `text-[couleur]`, AA 4.59–6.03:1 pour les autres catégories). Composant partagé, réutilisé sur les options désactivées de `ThemeToggle` (Clair/Auto) et sur le label `cal.com/{calUsername}` du widget de `ProfilePage`.

---

## 🔔 Système d'alertes (composant générique Alert)

4 types, structure visuelle identique, `rounded-xl` (pas `rounded-full` — bloc de contenu, pas une pill) :

| Type | Couleur | Icône Lucide | Origine |
|---|---|---|---|
| info | `tertiary` (`#D9D6FF` dark) | `Info` | Token existant réutilisé |
| succès | `primary` (`#57F1DB` dark) | `CheckCircle2` | Token existant réutilisé |
| avertissement | `warning` (`#FBBF24` dark) | `AlertTriangle` | **Nouveau token** (voir section Warning) |
| erreur | `error`/`on-error` (`#FFB4AB` dark) | `AlertCircle` | Token existant réutilisé |

**Structure** : fond teinté ~15% de la couleur du type, bordure ~40% opacité, icône alignée en haut à gauche. Titre en poids 500 dans la couleur du type, description en poids 400 (`text-on-surface-variant`, `text-sm` en `rem`).

**Accessibilité** : `role="alert"` ou `role="status"` selon l'urgence (assertif pour erreur/succès transitoire, moins urgent pour info). Icône + titre textuel portent le sens en plus de la couleur (critère "pas de couleur seule" satisfait par construction).

---

## 🏷️ Suggestions de tags générées par IA (ProjectDrawer, 11/07)

Chips distinctes des tags déjà sélectionnés (`TagPicker`) — jamais fusionnées automatiquement, l'admin choisit lesquelles ajouter.

- `rounded-full`, bordure **pointillée** `border-dashed border-primary/40` (vs bordure pleine sur les tags sélectionnés — la pointillé signale "proposition, pas encore appliquée")
- Texte `text-primary`, préfixe `+` littéral (pas d'icône Lucide séparée)
- Hover : `bg-primary-container/10`
- Disparaît de la liste dès qu'ajoutée (clic → migre dans le `TagPicker` correspondant, dédoublonnée si déjà présente)

---

## 🔘 Boutons — taille & iconographie (12/07)

**Taille** : resserrée sur tout le site — la plupart des CTA sont passés de `px-6/8/10 py-3/4` à `px-5 py-2.5` (CTA principaux) ou `px-4/5 py-1.5/2` (actions secondaires/inline, footers de modale). Les boutons icône-seul (`h-10/11/12 w-10/11/12`) sont descendus d'un cran (`h-9/10 w-9/10`), icône `size` réduite en proportion (18→16, 22→18).

**Deux exceptions explicitement conservées à leur taille d'origine** (CTA "hero", doivent rester imposants) :
- "Voir les projets" (page profil, `ProfilePage.tsx`) — `px-8 py-4`
- "Contacter" (page catalogue, `CataloguePage.tsx`) — `px-6 py-3`

**Icône systématique liée à l'action** — mapping appliqué partout où le libellé correspond, quel que soit le composant :

| Action | Icône Lucide | Exemples |
|---|---|---|
| Enregistrer / Envoyer | `Check` | "Enregistrer et publier", "Enregistrer comme brouillon", "Enregistrer les modifications", "Envoyer ma demande", "Envoyer le message", "Confirmer" (changement de statut) |
| Annuler | `X` | Tous les boutons "Annuler" (modales, footers de formulaire, panneau de refus) |
| Supprimer | `Trash2` | "Supprimer" (confirmation de suppression projet) |

Exception : le couple "Quitter sans enregistrer" / "Revenir au formulaire" a son propre traitement dédié (voir section Modales de confirmation ci-dessous) — pas d'icône `X` sur "Quitter sans enregistrer", `ArrowRight` sur "Revenir au formulaire".

**Non concerné** : les items de menu déroulant (`AccountMenu`, `ThemeToggle`) gardent leur padding d'origine — ce sont des lignes de liste dans un panneau, pas des boutons CTA autonomes.

**Carte profil — bouton "Accéder aux projets confidentiels" (19/07)** : couleur passée de `primary` à `tertiary` (`border-tertiary`/`text-tertiary`/`hover:bg-tertiary-container/10`/`ring-tertiary`, style outline conservé) pour se distinguer du CTA "Voir les projets" ; icône `Lock` remplacée par `LockOpen` (cadenas ouvert = accès disponible, cohérent avec l'action). Layout de la carte profil (`ProfilePage.tsx`) après plusieurs itérations le même jour : la ligne "Voir les projets" + 3 icônes sociales est alignée à gauche avec un espace élargi entre les deux groupes (`gap-12` desktop, contre `gap-4` d'origine) ; le bouton "Accéder aux projets confidentiels" est lui aussi aligné à gauche (plus de centrage) — les deux sont désormais alignés sur la marge gauche de la carte, comme le texte de présentation (`bio`, élargi de `max-w-md` à `max-w-xl` pour occuper toute la largeur disponible de la carte). Mobile inchangé dans tous les cas (CTA `w-full`, icônes centrées en dessous).

---

## 🪟 Modales — ombre & style de confirmation (12/07)

**Ombre systématique** : `shadow-2xl shadow-black/40` sur le conteneur de **toute** modale/dialogue (`AccessRequestModal`, `ProjectDrawer` — le panneau lui-même et ses 2 modales de confirmation imbriquées —, confirmation de suppression `AdminPage`). Remplace un `shadow-2xl` par défaut (teinte neutre du thème) ou une absence totale d'ombre — cohérence visuelle systématique plutôt qu'au cas par cas.

**Overlay** : `bg-background/80` à `/90` (plus opaque qu'avant sur `AccessRequestModal`, passé de `/70` à `/90`) + `backdrop-blur-sm`, combiné à `<AuroraBackground variant="modal" />` en fond (voir section Aurora) — un seul montage d'`AuroraBackground` par pile de modales (le composant est `position: fixed` plein écran ; le monter une seule fois à la racine du dialogue suffit même quand une confirmation s'ouvre par-dessus).

**Modale de confirmation "quitter sans enregistrer" (`ProjectDrawer`)** — restylée pour matcher le pattern de confirmation déjà utilisé sur "Demande envoyée" (`AccessRequestModal`) : icône dans un cercle teinté, titre, description, actions en pied de modale. Devient la référence pour toute future modale de confirmation avertissement/destructive :

- Icône `TriangleAlert` dans un cercle `h-16 w-16 bg-warning/15`, icône `text-warning`
- Titre "Quitter sans enregistrer ?" + description "Êtes-vous sûr de vouloir quitter sans enregistrer ? Vos données seront perdues."
- Deux boutons : "Quitter sans enregistrer" (`border-white/40`, pas de fill — neutre, volontairement **sans** icône `X` pour ne pas dupliquer le signal déjà porté par l'icône warning du bloc) / "Revenir au formulaire" (`bg-primary-container` plein, icône `ArrowRight` à droite du texte)

**`AccessRequestModal` — refonte structurelle (12/07)** : suppression du doublon de titre (l'eyebrow "Demande d'accès exclusif" faisait doublon avec le `<h2>` "Demander l'accès" juste en dessous, retiré) ; le texte explicatif, auparavant dans le header fixe (`shrink-0`), déplacé dans la zone scrollable du formulaire ; header et footer resserrés (`px-6 py-5`/`px-6 py-4` au lieu de `p-6`/`p-10`), zone de contenu d'autant agrandie ; bouton "Annuler" explicite ajouté dans le footer à côté du bouton d'envoi ; `border-b` ajoutée sous le header ; checkboxes de sélection de projet réduites (`Checkbox` accepte désormais une prop `size="sm" | "md"`, `h-4 w-4` au lieu de `h-5 w-5` — la checkbox RGPD reste en taille normale).

---

## ✍️ Titres de page — texte blanc (Outfit) + accent italique (12/07)

Grep `font-display-accent` : 8 occurrences (`AdminPage.tsx` ×2, `CataloguePage.tsx`, `ProfilePage.tsx`, `ProjectDetailPage.tsx` ×3, `NotFoundPage.tsx`) — toutes vérifiées individuellement.

**Règles appliquées à chaque occurrence** :
- L'accent italique commence toujours par une majuscule ("Clair", "Structurants", "Mesuré", "Introuvable", "Bord", "Accès", "Reçus", "Paramètres" — plusieurs corrigés, étaient en minuscule).
- Aucun point final sur ces titres, où qu'ils apparaissent (plusieurs `.` retirés après le `</span>`).
- Espace explicite entre le texte blanc et l'accent : `AdminPage.tsx` (`TabHeader` partagé par Dashboard/Demandes/Contacts/Paramètres) construisait `{title}<span>` sans espace garanti — deux appelants (`title="Messages"`, `title="Vos"`) produisaient bien un collage ("Messagesreçus", "Vosparamètres"). Fix générique : helper `titleWithSpacer()` qui ajoute un espace sauf si `title` se termine déjà par une élision (`'`), pour ne pas casser "Demandes d'accès".
- Taille de l'accent sur les pages visiteur (`ProjectDetailPage.tsx`, `ProfilePage.tsx`, `NotFoundPage.tsx`) : ne dépasse jamais le texte principal (contrainte dure) — héritait déjà de la même taille que le titre, donc déjà au plafond, aucun changement possible sans violer la contrainte. Là où l'accent avait sa propre classe de taille plus petite que le titre (`CataloguePage.tsx`), remonté d'un cran pour se rapprocher du titre sans le dépasser.
- **Exception dashboard admin (`AdminPage.tsx`, `TabHeader`)** : sur demande explicite, l'accent y **dépasse** volontairement le titre principal — `text-5xl md:text-6xl` (48/60px) contre `text-4xl md:text-5xl` (36/48px) pour le texte Outfit. La contrainte "n'excède jamais le titre" ne s'applique donc qu'aux pages visiteur ; le dashboard admin, déjà exempté de l'harmonisation de taille ci-dessous, a sa propre règle : l'accent y est le plus grand élément du titre.

**Harmonisation de taille** (visiteur uniquement — dashboard admin explicitement exempté) : `ProfilePage`/`CataloguePage`/`ProjectDetailPage` alignés sur un même palier desktop `md:text-6xl` pour le titre principal (`CataloguePage` était `md:text-7xl`, redescendu). Les tailles mobile (`text-4xl`/`text-5xl` selon la page) restent volontairement différenciées — cf. `headline-lg` (40px desktop / 32px mobile) qui autorise déjà cet écart mobile dans ce document. `AdminPage` (dashboard admin) garde sa propre échelle pour le titre (`text-4xl md:text-5xl`), non touchée par cette harmonisation — mais voir ci-dessus pour l'accent, agrandi au-delà de cette échelle.

---

## 🚫 États d'erreur de formulaire (validation, ProjectDrawer)

Introduit le 12/07 en remplaçant le pattern "bouton de soumission désactivé" (impossible pour l'utilisateur de savoir quel champ bloque) par un pattern "erreur trouvable" :

- **Contour du champ** : `border-error` (au lieu de `border-white/5`/`outline` par défaut) + `focus-visible:ring-error` (au lieu de `ring-primary`) tant que le champ a une erreur. Appliqué via `cn()`/`tailwind-merge` pour résoudre proprement le conflit avec la bordure de base.
- **Message d'erreur** : `text-error`, `text-xs`, précédé d'une icône Lucide `AlertCircle` (13px, `shrink-0`), alignés en `flex items-center gap-1`.
- **Formulation** : champ obligatoire vide → `"Le champ [Nom du champ] est obligatoire."` (libellé humain, pas le nom technique du champ). Dépassement de longueur → `"X/Y caractères max."` (message dédié, inchangé).
- **Pas de bouton désactivé** : le CTA principal ("Enregistrer et publier") reste cliquable même formulaire invalide — au clic, focus + scroll automatique vers le **premier champ en erreur selon sa position visuelle réelle** dans le formulaire (pas l'ordre de la fonction de validation, qui ne correspond pas à l'ordre des sections).
- S'applique à tout type de champ (texte, textarea, select, zone de dépôt d'image) — la zone de dépôt reçoit un `id`/`tabIndex={-1}` dédiés pour être focusable/scrollable comme un input classique.

---

## ⚠️ Formulaires — icône d'erreur sur les champs (12/07)

Pattern déjà en place sur `AccessRequestModal` (`FieldHint`, icône `CircleAlert` + texte `text-error` sous le champ) répliqué partout où un champ peut être en erreur :

- `ProjectDrawer.tsx` (`fieldError()`) — ajoutait déjà le message d'erreur mais sans icône, désormais `CircleAlert size={14}` + `role="alert"`, même style que `AccessRequestModal`.
- `AuthPage.tsx` — ajout d'une validation de champ minimale (email/mot de passe requis, au blur) qui n'existait pas du tout auparavant, avec le même traitement `CircleAlert`. L'erreur de connexion globale ("Email ou mot de passe incorrect") passe elle par le composant `Alert type="error"` (voir plus bas), pas par ce pattern de champ.
- `ContactForm.tsx` — idem, formulaire n'avait aucune validation autre que `required` HTML natif ; ajout d'un suivi `touched` par champ + icône `CircleAlert`.

**Non concerné, volontairement** : `AdminPage` → `ParametresTab` (aucun champ n'y est requis, rien à signaler) et le textarea "Motif du refus" de `DemandesTab` (déjà gaté par un bouton disabled, pas de pattern touched/error à dupliquer pour un unique champ) — pas de validation fabriquée artificiellement là où le formulaire n'en avait pas besoin.

---

## ⚙️ ParametresTab — branchement réel + toggle "Modifier mes informations" (14/07)

**Répartition des colonnes** (vérifiée via `list_tables`, ne rien supposer) :
- `designer_profiles` : `bio`, `photo_url`, `linkedin_url`, `twitter_url`, `website_url`, et deux colonnes **ajoutées cette session** (`profession`, `adjective` — absentes jusqu'ici, `ParametresTab` étant mock). `slug` reste en lecture seule (hors périmètre).
- `admin_settings` : uniquement `cal_username`. Table vide (0 ligne) jusqu'au premier enregistrement — `updateDesignerProfile()` fait donc un **upsert** dessus (vs update simple sur `designer_profiles`, dont la ligne existe déjà).
- `firstName`/`lastName`/`fullName`/`email`/`location` n'ont **aucune colonne DB** — restent statiques (`src/data/designer.ts`), hors périmètre de cette passe. Les champs Prénom/Nom du mock ont été retirés du formulaire plutôt que laissés "éditables" sans persistance réelle.

**RLS — lecture publique de `cal_username`** : `admin_settings` n'a qu'une policy SELECT admin-only (`get_my_role() = 'admin'`), donc un visiteur anonyme sur `/[slug]` ne peut pas lire `cal_username` pour savoir si le widget Cal.com doit s'afficher. Plutôt qu'ouvrir toute la table en lecture publique, fonction `get_public_cal_username()` `SECURITY DEFINER` dédiée (même pattern que `get_my_role()`), n'exposant que ce seul champ, `grant execute` à `anon`/`authenticated`. `getDesignerProfile()` (`src/data/designer.ts`) l'utilise et est partagée par `ProfilePage.tsx` (public) et `ParametresTab` (admin).

**Storage** : nouveau bucket `designer-photos` (public lecture, écriture admin only) — même pattern RLS que `project-thumbnails`, pour la photo de profil. Upload via `uploadDesignerPhoto()` (`src/lib/storage.ts`).

**Toggle "Modifier mes informations"** : tous les champs sont `disabled` par défaut (lecture seule) ; bouton `Pencil` en haut à droite du `TabHeader` (prop `cta`) passe en mode édition. `Enregistrer`/`Annuler` n'apparaissent qu'en édition — `Annuler` recharge les valeurs serveur (pas de snapshot local, un simple refetch). Même reprise du pattern erreur de champ que `ProjectDrawer`/`ContactForm` (`border-error` + `CircleAlert` 14px) pour la validation d'URL (LinkedIn/X/site web — vide = valide, tous optionnels).

**Icônes sociales réelles** (`ProfilePage.tsx`, révisé le 14/07) : exactement **3** boutons-icônes, dans cet ordre — LinkedIn, X, Site web. Le bouton mailto (`AtSign`) a été retiré. Ne s'affichent que si le champ correspondant est renseigné (tous optionnels).

**⚠️ Exception à la règle "Lucide uniquement"** : Lucide n'a pas de vrai logo de marque X/LinkedIn (juste un glyph `X` générique, identique au bouton fermer utilisé partout ailleurs dans l'app — ambigu). Décision explicite de l'utilisatrice : `react-icons` (`react-icons/fa6`, `FaLinkedin`/`FaXTwitter`) pour ces deux icônes de marque uniquement — nouvelle dépendance ajoutée au projet. Le reste de l'app (nav, boutons, badges, états) reste Lucide exclusivement ; ne pas généraliser `react-icons` au-delà de ce cas précis (logos de marque non couverts par Lucide). `Globe` (site web) reste Lucide, ce n'est pas un logo de marque.

**URLs factices** : `linkedin_url`/`twitter_url`/`website_url` (mock `src/data/designer.ts` + ligne `designer_profiles` seedée) pointent vers `https://example.com/...` (domaine réservé IANA, jamais de contenu réel) plutôt que vers de vrais comptes/domaines — évite de lier vers un compte existant qui n'appartient pas au projet.

**Widget Cal.com — masqué si `cal_username` vide** : `CalEmbed.tsx` reste non câblé/non touché (toujours hors périmètre, cf. session ContactForm) — `ProfilePage.tsx` porte directement sa propre condition (`{designer.calUsername && (...)}`) autour du bloc "Réserver un créneau" existant, sans dupliquer le composant ni sa logique.

---

## 📬 ContactForm.tsx — branchement réel + filtres dashboard admin (14/07)

**ContactForm.tsx** (page profil public) passe du mock au réel :
- Champ "Entreprise" retiré (pas de colonne correspondante dans `contacts`, pas dans le spec) — seuls Nom/Email/Message/RGPD subsistent.
- Insert via `submitContact()` (`src/data/contacts.ts`), `type: "contact"` (distinct de `"rdv"`, réservé à un futur flux Cal.com hors périmètre). RLS déjà en place (`contacts_insert_anyone`) — aucune policy créée.
- Reprend exactement le pattern erreurs de champ de `ProjectDrawer`/`AccessRequestModal` (`CircleAlert` 14px, `border-error`, focus+scroll premier champ en erreur, bouton jamais désactivé pour une erreur de contenu — seuls RGPD non coché et l'envoi en cours désactivent le CTA).
- Bouton corrigé en `bg-primary-container` + **`text-on-primary-container`** (était `text-on-primary` — non conforme à la règle CTA de ce document, cf. section "Règle de mapping M3").
- Case RGPD : composant `Checkbox.tsx` existant réutilisé tel quel (déjà `border-outline`, jamais besoin de retoucher).
- Pas de "vue de confirmation" plein écran : succès = `Alert type="success"` inline au-dessus du formulaire réinitialisé (le visiteur peut renvoyer un message).

**Dashboard admin — onglet "Messages reçus"** (`ContactsTab`, `AdminPage.tsx`) : passe du mock (`seedContacts`) au réel (`getAllContacts()`/`updateContactStatus()`), RLS déjà en place (`contacts_select_admin`/`contacts_update_admin`, `get_my_role() = 'admin'`).
- **Progression de statut à sens unique** : `new → treated → archived`, jamais de retour à `new` — un message archivé n'a plus de bouton de cycle (`nextContactStatus` n'a pas d'entrée pour `archived`).
- Badge `StatusBadge` du statut "Traité" affiche désormais une icône `Check` (déjà importée dans `StatusBadge.tsx`, pas de nouvel import).
- Badge de notification sur l'onglet "Messages" du sidebar (comptage `status = 'new'`) — même mécanique que le badge "Accès" (`pendingCount`).

**Filtres du dashboard admin — un seul système, partout** : le pattern "état vide/plein" du catalogue (section "Système de filtres" ci-dessus — `border-outline` transparent au repos, `bg-[couleur]/15` + `border-[couleur]/40` + `text-[couleur]` sélectionné) est désormais la référence pour **tout** filtre du dashboard admin, pas seulement le catalogue public :
- Nouveau filtre Statut de "Messages reçus" (Tous/Nouveau/Traité/Archivé) : couleur `tag-keywords` (indigo) — cohérent avec la couleur de nav déjà attribuée à l'onglet Messages (`NAV_ACTIVE_CLASSES.nouveau`, icône `text-tag-keywords`).
- Filtre "période" de Veille Hebdo sur le Dashboard (`DashboardTab`) : converti d'un `<select>` natif vers les mêmes pills, couleur `tag-sector` (cyan) — cohérent avec le filtre Statut déjà pill-stylé de l'onglet Veille Hebdo lui-même (`veillePillCls`, déjà existant, réutilisé tel quel plutôt que dupliqué).

---

## 🏷️ Badge de statut avec suffixe (dashboard admin uniquement)

`StatusBadge` accepte un prop optionnel `suffix?: string`, rendu en `normal-case` juste après le label (le label lui-même reste `uppercase`) : ex. `"CONFIDENTIEL • Sensible"`.

- **Usage unique** : la liste "Mon catalogue Projets" du dashboard admin (`AdminPage.tsx`), pour afficher le niveau de sensibilité (`Sensible`/`Très sensible`) des projets confidentiels non supprimés.
- **Ne pas généraliser** : les autres usages de `StatusBadge` (catalogue public via `ProjectCard.tsx`, onglets Accès/Messages) n'utilisent pas ce prop — le catalogue public affiche déjà l'info de sensibilité via son propre badge dédié ("Confidentiel • {sensibilité}", voir section F-12 ci-dessus), pas de doublon à créer.

---

## 🌌 Aurora (fond décoratif)

**27/08 — deux tentatives de rubans CSS/SVG (taches circulaires → pilules inclinées → courbes SVG inspirées d'une photo) explorées puis abandonnées sur demande explicite ("reviens au background avant toutes les modifications"), avant la refonte WebGL ci-dessous qui est l'état final retenu.**

**Refonte WebGL "Soft Aurora"** : l'ancien fond CSS (4 taches circulaires floutées, `.aurora-bg::before/::after` + `.aurora-blob`/`.aurora-blob-indigo`, `radial-gradient` + `filter: blur()`) est remplacé par un shader WebGL — composant `SoftAurora.tsx`, installé depuis [reactbits.dev](https://reactbits.dev) (Background Studio, preset "Soft Aurora") via `npx shadcn@latest add @react-bits/SoftAurora-JS-CSS` puis converti en TypeScript (le script d'auto-install échouait sur cette machine, `bun` n'étant pas installé — dépendance `ogl` ajoutée manuellement via `npm install ogl`, aucune sous-dépendance). Étendu de 2 à 4 couleurs (`uColor3`/`uColor4` ajoutés au shader — glow/gradient/poids de mélange dupliqués symétriquement à `uColor1`/`uColor2`, y compris dans la branche `uLightMode`) pour représenter les 4 teintes du design system au lieu de 2. `AuroraBackground.tsx` reste le point de montage public (même prop `variant`, mêmes 6 emplacements : `ProfilePage`, `CataloguePage`, `SlideSheet`, `AccessRequestModal`, `AuthPage`, `AdminPage`) — il ne fait plus que monter `<SoftAurora />` avec les 4 couleurs codées en dur (`#2DD4BF`/`#7C3AED`/`#06B6D4`/`#818CF8`, correspondant à `aurora-teal/purple/cyan/indigo`) ; `variant` ne différencie plus le rendu pour l'instant (avant : géométrie/alphas différents par variante) — disponible pour une différenciation future.

**Activé sur mobile depuis le 28/08 (demande explicite, testé en direct sur viewport 375px sans erreur ni gel)** : le garde-fou `(max-width: 767px)` a été retiré de `AuroraBackground.tsx` — un canvas WebGL unique est architecturalement différent de l'ancien fond CSS (pas d'empilement de calques `filter: blur()`, cause documentée des gels/écrans noirs du 23/07), donc le risque n'est pas automatiquement identique. À surveiller : si des soucis de perf remontent sur mobile réel (pas seulement en émulation navigateur), réintroduire la media query. `prefers-reduced-motion` reste respecté (accessibilité, indépendant du sujet perf) — seul garde-fou restant, géré en JS via `matchMedia` (`styles.css` ne garde que le conteneur `.aurora-bg` en position `fixed`, aucune media query de repli).

**Correctif "arc-en-ciel" (28/08)** : le shader modulait chaque `uColorN` par un `cosineGradient` (dégradé RGB cyclique en teinte, indépendant de la couleur assignée) — avec 4 calques superposés à des phases différentes, ça balayait tout le spectre au lieu de rester sur les 4 teintes du design system. Le `cosineGradient` a été retiré du calcul de couleur (fonction GLSL conservée mais non appelée, `uColorSpeed` devenu un uniform inerte) : seule l'intensité du halo (bruit de Perlin, `auroraGlow`) module désormais chaque couleur, qui reste fixe par calque — mélange uniquement là où les halos se chevauchent, pas de cycle de teinte. `brightness` abaissé de `0.9` à `0.45` (jugé trop vif) et `bandHeight` remonté de `0.4` à `0.7` (bande repositionnée plus haut dans la page, vers le haut du hero plutôt que le milieu).

**Tokens de base** — ces valeurs restent la référence des 4 couleurs (utilisées pour dériver les hex passés en dur à `SoftAurora`), même si l'ancien mécanisme CSS (`radial-gradient` + custom properties par variante `--aurora-bg--modal`) n'est plus utilisé :

| Token | Dark | Light |
|---|---|---|
| `aurora-teal` | `rgba(45,212,191,0.44)` | `rgba(45,212,191,0.36)` |
| `aurora-purple` | `rgba(124,58,237,0.4)` | `rgba(124,58,237,0.32)` |
| `aurora-cyan` | `rgba(6,182,212,0.36)` | `rgba(6,182,212,0.3)` |
| `aurora-indigo` | `rgba(129,140,248,0.38)` | `rgba(129,140,248,0.34)` |

**Variant `modal`** — mêmes 4 teintes, alphas propres et plus élevés, redéfinis localement sur `.aurora-bg--modal` (les 4 custom properties sont simplement réassignées dans ce scope, aucune règle dupliquée sur chaque pseudo-élément) :

| Token | Dark (modal) | Light (modal) |
|---|---|---|
| `aurora-teal` | `rgba(45,212,191,0.56)` | `rgba(45,212,191,0.48)` |
| `aurora-purple` | `rgba(124,58,237,0.52)` | `rgba(124,58,237,0.44)` |
| `aurora-cyan` | `rgba(6,182,212,0.48)` | `rgba(6,182,212,0.42)` |
| `aurora-indigo` | `rgba(129,140,248,0.5)` | `rgba(129,140,248,0.46)` |

**3ᵉ passe d'intensification (19/07)** : alphas des deux tables ci-dessus remontés une nouvelle fois (+~20 % relatif chacun) sur demande explicite ("accentuer l'effet aurore boréale"). À cette occasion, les 3 dialogs en lecture seule d'`AdminPage.tsx` qui n'avaient **jamais** monté `<AuroraBackground variant="modal" />` (`AccesConfidentielsDrawer`, `MesContactsDrawer`, l'aside détail Veille) l'ont reçu — un oubli pré-existant, pas une régression de cette passe. Le variant `modal` couvre désormais systématiquement tout dialog/drawer plein écran de l'app, pas seulement les 4 qui l'avaient déjà.

**⚠️ Flou réduit sur mobile — coût GPU excessif, tous téléphones confondus (23/07)** : signalé après la passe ci-dessus — page qui reste bloquée, qui s'affiche puis passe noire, ou plus aucun clic qui répond. Confirmé par l'utilisatrice sur tous types de téléphones (pas seulement iPhone/Safari) : donc pas un bug de compositeur propre à un moteur en particulier, mais un coût de calcul réellement excessif de l'effet lui-même — 4 calques plein écran (`.aurora-bg` en `position: fixed` sur **chaque** page/modale/tiroir) avec un flou de 140-160px chacun est lourd à composer pour n'importe quel GPU mobile d'entrée/milieu de gamme, quel que soit le navigateur. Le risque était déjà présent avant, mais la 3ᵉ passe d'intensification + l'ajout du variant `modal` à 3 dialogs de plus l'a nettement aggravé. Fix : `@media (max-width: 767px)` dans `styles.css` réduit le rayon de flou d'environ 140-160px à 40-52px pour `.aurora-bg` et `.aurora-section` (desktop inchangé, jamais signalé là) — la règle s'applique à tous les navigateurs mobiles, pas seulement WebKit. `will-change: transform` retiré au passage sur `.aurora-bg::before`/`::after` — mort depuis le début (les keyframes `aurora-float-*` ne sont appliquées nulle part), ne faisait que réserver un calque de composition en continu sans aucun bénéfice.

CSS-only (`.aurora-bg` + `AuroraBackground.tsx`), radial-gradient flouté. `aurora-indigo` a d'abord existé uniquement pour la 4ᵉ teinte du dashboard admin (`SectionAurora`) ; il rejoint désormais aussi la composition principale `.aurora-bg` (4ᵉ tache, `.aurora-blob-indigo`) — toujours aucune nouvelle couleur, seulement une variante translucide d'un token déjà existant (même hex que `tag-keywords`).

**Historique des correctifs de visibilité (12/07)** — le fond était correctement câblé dès le départ (composant monté, tokens définis, empilement correct — vérifié en direct à chaque étape), seule l'intensité posait problème :
1. *Première passe* : un `opacity: 0.9` non documenté sur `.aurora-bg::before`/`::after` rabotait l'alpha déjà faible des tokens — retiré. Alphas dark de teal/purple/cyan doublés (`0.12→0.24`, `0.10→0.20`, `0.08→0.16`).
2. *Deuxième passe* (celle-ci) : encore jugé trop discret. Alphas remontés une nouvelle fois vers les valeurs ci-dessus (base) et `aurora-indigo` rejoint pour la première fois la composition principale à 4 couleurs. Le variant `modal` gagne son propre jeu d'alphas (plus marqués que les pages) au lieu de l'ancien multiplicateur `opacity: 0.6` qui l'atténuait — inversion volontaire : une modale doit se détacher davantage, pas moins. Le flou (`blur(140-160px)`) n'a été touché à aucune des deux passes, choix esthétique séparé.
3. Vérifié visuellement sur les 3 surfaces (profil, catalogue, modale `ProjectDrawer`) en dark et en light après cette 2ᵉ passe — les 4 couleurs sont nettement plus présentes, y compris dans leurs zones de recouvrement (teinte mixte, attendu pour un effet aurora). Aucun texte n'est directement posé sur `.aurora-bg` sans fond intermédiaire (`glass-card`, carte, panneau de modale) sauf le titre `h1` de `CataloguePage.tsx` — vérifié par calcul de contraste WCAG au pire cas (recouvrement au centre d'une tache) : ≥6:1 en dark, ≥13:1 en light, largement au-dessus du seuil AA (le texte est à l'extrémité de luminance opposée au fond dans les deux thèmes, donc insensible à la teinte de l'aurora en dessous).

**Variantes (`AuroraBackground` prop `variant`, 12/07)** — même famille de 4 couleurs partout, seule la répartition change :

| Variant | Usage | Composition |
|---|---|---|
| `profile` (défaut) | Page profil public | 4 taches : teal en haut-gauche, purple en bas-droite, cyan centrée, indigo en bas-gauche — composition d'origine |
| `catalogue` | Catalogue de projets | Mêmes 4 couleurs, réparties différemment (teal en haut-**droite** et plus petit, purple en bas-**gauche** et plus petit, cyan décalée à 30%/65% et plus large, indigo en haut-**gauche**) — pour que les deux pages restent reconnaissables l'une de l'autre sans changer de palette |
| `modal` | Derrière chaque dialogue d'action ponctuelle (`AccessRequestModal`, confirmation de suppression `AdminPage`) + les feuilles mobiles (`SlideSheet`) | Même géométrie que `profile`, alphas propres et plus marqués (table ci-dessus) — combinée à l'overlay `bg-background/80-90` + `backdrop-blur-sm` déjà en place, qui apporte le flou |
| `auth` (28/08, retouche) | Page `/auth` (`AuthPage.tsx`) uniquement | Garde l'animation Soft Aurora (contrairement à `modal`, cf. bloc "Fond animé + carte glass" plus bas) avec `bandHeight={0.5}` au lieu de `0.7` — bande centrée verticalement pour s'aligner avec la carte de connexion, elle-même centrée dans le viewport (`/auth` n'a pas de hero top-heavy comme `profile`/`catalogue`) |

**Retiré des drawers (11/08)** : `<AuroraBackground variant="modal" />` retiré de `ProjectDrawer` (panneau d'édition + ses 2 confirmations imbriquées, qui partageaient ce montage unique) et des 3 dialogs en lecture seule d'`AdminPage.tsx` ajoutés le 19/07 (`AccesConfidentielsDrawer`, `MesContactsDrawer`, aside détail Veille) — sur demande explicite. Ce sont des panneaux de contenu/lecture consultés plus longtemps que les dialogues d'action ponctuelle listés ci-dessus (confirmation, formulaire court, connexion), où le halo devenait plus gênant qu'utile. Le variant `modal` lui-même (tokens/alphas des deux tables ci-dessus) n'a pas changé, seuls ces 4 montages ont été retirés — `AccessRequestModal`, la confirmation de suppression `AdminPage`, `/auth` et les feuilles `SlideSheet` (dont le tiroir mobile `from="left"`, cf. section Navigation mobile) gardent l'effet.

**Dashboard admin — un halo par section (`SectionAurora`, `AdminPage.tsx`, 12/07)** : une seule tache douce (`.aurora-section`, `position: absolute` dans le conteneur de la section — pas `position: fixed` plein écran comme `.aurora-bg`), couleur dominante différente par onglet, réutilise les 4 teintes déjà existantes :

| Section admin | Couleur halo | Token aurora |
|---|---|---|
| Catalogue projets | teal | `aurora-teal` |
| Demandes d'accès | violet | `aurora-purple` |
| Messages (Contacts) | cyan | `aurora-cyan` |
| Paramètres | teal (depuis le 14/07, était indigo) | `aurora-teal` |
| Vue d'ensemble (Dashboard) | — | aucun |

**⚠️ Depuis le 13/07, le halo de section (ci-dessus) et la couleur de nav active (ci-dessous) ne sont plus forcément la même teinte** — décision explicite, périmètres volontairement dissociés (ex. Messages : halo toujours cyan, nav désormais tertiary-container). Ne pas chercher à les réaligner sans nouvelle demande. **Exception : Paramètres**, dont halo et nav ont au contraire été réalignés (les deux en teal) le 14/07 sur demande explicite pour matcher Vue d'ensemble.

## 🖼️ Fiche projet — hero parallax, flèche header, galerie grille + légendes (01/09, retouché le 02/09 ×4)

**⚠️ Bug corrigé — `position: sticky` cassé site-wide par `overflow-x: hidden` sur `body` (02/09)** : en implémentant le sticky de l'aside ci-dessous, testé en direct au scroll (pas juste via `getComputedStyle` — leçon retenue, cf. `CLAUDE.md`) et découvert que l'élément ne restait **jamais** accroché (son `rect.top` continuait à décroître avec le scroll au lieu de se figer à `112px`). Cause : la règle globale `html, body { overflow-x: hidden; }` (`styles.css`, filet de sécurité anti-débordement horizontal du 22/07) déclenche un fixup du CSS spec — dès qu'`overflow-x` est non-`visible` sur un élément, `overflow-y` calcule automatiquement à `auto` sur ce **même** élément, même sans déclaration explicite. `body` devenait donc un second "conteneur de scroll" aux yeux de `position: sticky` (dont le *containing block* se résout à la plus proche ancêtre avec un `overflow` calculé non-`visible`, que ce conteneur scrolle réellement ou non) — et comme `body` ne déborde jamais de son propre contenu (sa hauteur = sa hauteur de contenu, jamais contrainte), il n'offre aucune marge de scroll interne : le sticky s'y comporte comme un `position: static` normal. **Fix** : `overflow-x: hidden` déplacé sur `html` seul (déjà la racine réelle du scroll du document — `html` protège déjà tout débordement horizontal descendant, y compris via `body`), `body` repasse à `overflow: visible` par défaut. Seul usage de `sticky` dans tout le codebase au moment du fix (`grep -rn sticky src`) — aucun autre composant affecté, mais **retenir pour tout futur `position: sticky`** : ne jamais déclarer `overflow-x` (ou toute valeur d'`overflow` non-`visible`) sur `body` sans vérifier l'impact sur les sticky descendants — le bug est silencieux (aucune erreur console, le sticky rend juste comme un bloc normal).

**Hero — démarre sous la navbar avec un espacement resserré, sans dégradé (02/09, taille et parallax réajustés)** : la `<section>` porte `mt-24` (96px, réduit depuis `mt-32`/128px — ~23px de respiration sous le header `fixed` de 73px). Dégradé `bg-gradient-to-t` en bas de l'image resté supprimé. **Aspect ratio revenu à `aspect-[3/1]` desktop / `aspect-[4/3]` mobile** (valeurs d'origine du 01/09) — un agrandissement à `aspect-[2/1]`/`aspect-square` avait été tenté puis jugé trop imposant, retouché en retour le même jour. **Parallax accentué, conservé** : `PARALLAX_FACTOR = 0.35` (depuis `0.2`), marge de débordement de l'image `h-[180%]`/`top:-40%` (m=0.4 ≥ f=0.35, cf. dérivation ci-dessous) — ce réglage ne dépend pas du ratio d'aspect du hero (uniquement de `heroHeight`, capturé dynamiquement via `getBoundingClientRect`), donc inchangé par le retour en arrière sur la taille. Dérivation de la marge nécessaire : avec une marge `m` par bord et un facteur `f`, il faut `f ≤ m` puisque `progress` plafonne à ~`heroHeight` juste avant que la garde `rect.bottom <= 0` ne coupe l'effet. **Toujours calculé via `section.getBoundingClientRect()`** (pas `window.scrollY`) — robuste par construction à n'importe quel décalage du hero dans le document. **Retenir pour tout futur effet scroll-continu similaire** : la règle CSS globale `@media (prefers-reduced-motion: reduce)` ne neutralise que les `transition`/`animation` CSS, jamais un `style.transform` posé en JS — garde explicite `prefersReducedMotion()` (`src/lib/utils.ts`) obligatoire en tête de l'effet. Mutation du style faite via `ref` (pas de `setState` par tick de scroll), throttlée par `requestAnimationFrame`.

**Bloc d'informations projet — sticky jusqu'à la galerie seulement (02/09)** : la galerie étant passée en pleine largeur de page (voir plus bas), elle ne peut plus être un membre de la même grille CSS que l'aside sans que le *containing block* du `sticky` ne s'étende jusque dans la galerie (un sticky reste visible tant que son bloc englobant est à l'écran, quelle que soit la hauteur de ce bloc). `ProjectDetailPage.tsx` calcule donc `contentBlock`/`asideCard`/`gallerySection` une seule fois (des variables JSX, pas de duplication de contenu) puis les rend dans **deux dispositions distinctes** (`md:hidden` / `hidden md:block`, même convention que `QuickAccessCard` — cf. `CLAUDE.md`, Navigation mobile) : mobile = un seul `flex flex-col` empilant contenu → galerie → aside dans cet ordre DOM direct ; desktop = une grille 2 colonnes `aside(md:col-span-3, sticky) | content(md:col-span-9)` **suivie d'un sibling séparé** pour la galerie (pas un membre de cette grille) — le *containing block* du sticky s'arrête donc net à la fin de cette grille, exactement là où la galerie commence, plus jamais au-delà. Largeur de l'aside inchangée (`max-w-xs`, 320px). **Sticky réellement fonctionnel seulement après le fix `overflow-x` ci-dessus** — vérifié en direct (scroll réel + lecture de `rect.top` à plusieurs paliers, pas juste `position: sticky` en `getComputedStyle`) : reste figé à `top: 112px` tant que l'aside a de la marge, se détache naturellement en fin de conteneur (avant la fin stricte si la carte elle-même est plus haute que l'espace restant — comportement CSS normal, jamais au-delà de la fin du conteneur donc jamais visible pendant le scroll de la galerie).

**Flèche retour intégrée au header au scroll** (`Header.tsx`) : troisième branchement par route du header, après `isAdminRoute` — `isProjectDetail = Boolean(useMatch("/:slug/projects/:id"))`. Sur cette route uniquement, le wordmark "Folio+" (desktop **et** mobile, décision explicite) est crossfadé avec une flèche retour vers `/${slug}/projects`, pilotée par le même état `scrolled`/`SCROLL_THRESHOLD` que la transition fond/bordure du header (cohérence de timing demandée). Pattern d'implémentation : le wordmark reste un élément **normal, en flux** (détermine la taille de la boîte), seule la flèche est `absolute inset-0` par-dessus dans un wrapper `relative` — évite de deviner/forcer une taille de boîte fixe. `transition-opacity duration-[var(--duration-standard)] ease-signature`, pure CSS donc déjà couverte par la règle globale reduced-motion (pas de garde JS nécessaire ici, contrairement au parallax). Réutilisable tel quel pour toute future page qui aurait besoin d'un bouton retour intégré au header au lieu d'un bouton flottant dédié.

**Galerie — CSS Grid `col-span` + `row-span` calculé par image, `grid-flow-dense`, pleine largeur de page (02/09, remplace le masonry `columns-*` du 01/09)** : `ProjectDetailPage.tsx`, composant `ProjectGallery`. Le masonry CSS-columns d'origine ne permettait qu'un span-tout ou rien (natif, aucun span partiel par item) — remplacé par une vraie grille `grid-flow-dense`, qui comble les trous laissés par les blocs plus grands avec les blocs plus petits qui suivent dans l'ordre. Coins arrondis retirés (bords francs). **Pleine largeur de page** : la grille sort de la contrainte `max-w-[1440px]` du conteneur `<main>` via la technique du "full-bleed enfant" — `relative left-1/2 right-1/2 -mx-[50vw] w-screen`, un wrapper qui s'étend à 100% de la largeur du viewport quel que soit son ancêtre, plutôt que de sortir physiquement du DOM de `<main>` (qui aurait cassé l'ordre mobile contenu→galerie→aside, cf. bloc d'informations ci-dessus). Gouttière horizontale standard (`px-5 md:px-16`) conservée à l'intérieur du wrapper.

**⚠️ Row-span calculé par image à partir de son vrai ratio, plus jamais fixe par `size_variant` (02/09)** — remplace un premier essai `object-contain` (letterboxing, cellules jamais "pleines") lui-même remplacé une hauteur de cellule fixe par taille (`row-span-1`/`row-span-2`, qui forçait soit un recadrage `object-cover`, soit des bandes vides `object-contain` dès que le ratio réel de la photo ne correspondait pas exactement à la cellule — le cas quasi systématique). Nouvelle mécanique (`computeGalleryRowSpan`, `ProjectDetailPage.tsx`) :
- `size_variant` ne contrôle plus que la **largeur** (`SIZE_VARIANT_COL_SPAN` : `small`/`tall` → 1 colonne, `wide`/`large` → 2, `full` → toutes) — `tall`/`large` ne forcent plus de hauteur, la distinction qu'ils suggéraient est désormais automatique.
- La grille utilise une unité de ligne **très fine** (`GALLERY_ROW_UNIT = 8px`, posée en `style={{ gridAutoRows: '8px' }}` — **pas** une classe Tailwind statique, piège à ne pas reproduire : oublier ce `grid-auto-rows` fait que `grid-row: span N` s'étend sur des pistes implicites `auto` sans rapport avec l'unité utilisée dans le calcul JS, symptôme observé une fois : cellules bien plus courtes que prévu, complètement décorrélées du ratio réel).
- Pour chaque image, une fois son ratio réel connu (`naturalWidth/naturalHeight`, capturé au `onLoad` de la balise `<img>`, jamais stocké en base), `computeGalleryRowSpan` déduit la largeur réelle en px de sa cellule (colonnes × largeur de colonne mesurée + gaps internes) puis le nombre de lignes de 8px nécessaires pour que la cellule ait exactement ce ratio. La légende (overlay, cf. plus bas) ne consomme aucun budget de hauteur séparé — un précédent essai en bloc statique sous l'image en avait besoin (`GALLERY_CAPTION_HEIGHT`), retiré depuis que la légende est repassée en overlay.
- Ratio clampé à `[1/2.2, 2.2]` (`GALLERY_MIN_RATIO`/`GALLERY_MAX_RATIO`) pour qu'un format extrême (capture d'écran très large, bannière très haute) ne produise pas une cellule disproportionnée — seul cas où `object-cover` recadre encore un peu, trade-off assumé et documenté en commentaire dans le code.
- **Largeur de grille mesurée en direct** via `ResizeObserver` (pas une valeur Tailwind statique) — indispensable puisque la galerie est fluide/pleine largeur (donc jamais une largeur de colonne fixe) : `ProjectGallery` est donc un vrai composant (pas juste une valeur JSX comme `contentBlock`/`asideCard`), avec sa propre instance de state/observer, monté **une fois par disposition** (mobile `totalCols=2`/`gapPx=8`, desktop `totalCols=4`/`gapPx=12` — cf. bloc d'informations ci-dessus pour le pourquoi des deux dispositions) puisque chacune a sa propre largeur de grille et son propre nombre de colonnes.
- Avant que le ratio réel d'une image soit connu (juste après montage), un ratio par défaut de `1` (carré) sert de placeholder — corrigé sans à-coup dès le `onLoad` réel.
- `object-cover` conservé (pas `object-contain`) : puisque la cellule colle désormais de très près au ratio réel de l'image, le recadrage résiduel (arrondi à l'unité de 8px, clamp d'aspect ratio) est de l'ordre de quelques pixels, imperceptible — contrairement à l'essai `object-contain` d'une passe précédente, qui garantissait l'absence de recadrage mais au prix de bandes vides visibles à chaque écart de ratio.

Vérifié en direct (pas seulement `tsc`) : ratio réel vs ratio rendu de chaque vignette comparés via `getBoundingClientRect`, écart de quelques % maximum (donc quelques px de recadrage réel, invisible) sur les 11 images de test, y compris les cas clampés (2 captures d'écran très larges, ratio ~4.75, ramenées à 2.2).

**Migration de données (02/09)** : au moment de la bascule, 11 images existaient déjà sur un vrai projet (`Aurora Design System`, uploadées par l'utilisatrice en testant la galerie) — `width_variant` renommée en `size_variant` (pas juste ses valeurs) plutôt que recréée, pour préserver l'historique de colonne ; mapping `full → full` (5 lignes), `half → wide` (6 lignes), `third → small` (0 ligne, mappé par prudence). Vérifié en direct après migration (les 11 images continuent de s'afficher, tailles correctement traduites) avant de considérer la bascule terminée.

**Légende (`caption`, nouvelle colonne `project_images`) — overlay bas-droite (02/09, va-et-vient)** : bas-gauche à l'origine (01/09) → sortie en bloc statique sous l'image le même jour (pour libérer le budget de hauteur de l'image dans le calcul du row-span, cf. galerie ci-dessus) → **revenue en overlay, bas-**droite** cette fois** (sur demande explicite), le calcul de row-span n'ayant alors plus besoin de réserver de budget de hauteur pour elle (`computeGalleryRowSpan` a perdu son paramètre `hasCaption`/`GALLERY_CAPTION_HEIGHT`, l'image occupe de nouveau 100% de la cellule). Implémentation : `<p>` `absolute bottom-0 right-0 max-w-[80%] bg-surface-container-lowest/75 px-3 py-1.5 text-xs text-white`, dans le même conteneur `relative overflow-hidden` que l'`<img>` (plus de `flex flex-col`/`flex-1` intermédiaire, redevenu inutile) — jamais rendu si vide, pas de placeholder, toujours visible si présent (pas de `hover`). `max-w-[80%]` évite qu'une légende longue ne colle au bord gauche de la vignette. Fond en token DS (`surface-container-lowest`, teinté) plutôt qu'un `bg-black/*` brut. Pré-remplie à l'upload (`ProjectDrawer.tsx`, `captionFromFilename()`) depuis le nom de fichier : extension retirée, tirets/underscores remplacés par des espaces (`"final-mockup_desktop-v2.png"` → `"final mockup desktop v2"`) — éditable ensuite par l'admin, jamais forcée.

**Numérotation dans le formulaire (`ProjectDrawer.tsx`)** : pastille `index + 1` à côté de chaque vignette de la galerie — dérivée directement de la position dans la liste de travail unifiée (`galleryItems`), donc déjà à jour en temps réel au réordonnancement (flèches haut/bas), aucun état dédié à maintenir.

**⚠️ Piège Storage RLS découvert en construisant cette galerie** (bucket `project-gallery`) : voir `CLAUDE.md`, section RLS — un bucket public sans **aucune** policy SELECT sur `storage.objects` casse silencieusement les DELETE/UPDATE authentifiés (l'API Storage a besoin d'une recherche interne soumise à RLS avant de muter). Probablement le même trou sur `project-thumbnails`/`designer-photos` depuis le 15/07 — flag séparé, pas corrigé dans cette passe.

## 🔑 Page `/auth` + `PersonaSwitcher` (15/07)

`AuthPage.tsx` reçoit le même traitement que les autres surfaces de l'app : accroche renforcée ("Content de vous revoir" + sous-titre), lien de retour vers le portfolio public (`← Retour au portfolio`) et un renvoi vers la demande d'accès (`AccessRequestModal`, via le catalogue) pour les visiteurs sans compte — `/auth` reste **login-only**, aucune bascule "Sign up" (la création de compte passe exclusivement par le flux F-12). CTA "Se connecter" corrigé de `text-on-primary` vers `text-on-primary-container` (divergence à la règle M3 de ce document, déjà corrigée ailleurs mais oubliée ici).

**Fond animé + carte glass (28/08, retouche)** : `AuroraBackground variant="modal"` (fond neutre statique, cf. section Aurora ci-dessus) remplacé par une nouvelle valeur dédiée **`variant="auth"`** qui garde l'animation Soft Aurora (comme `profile`/`catalogue`) — sur demande explicite ("je veux l'animation sur la page de connexion"). `/auth` n'est pas une vraie modale (page standalone, rien à assombrir derrière), le fond statique `modal` n'avait donc plus vraiment de justification une fois le reste de l'app passé à l'animation. Nouveau réglage `bandHeight` propre à ce variant (`0.5`, la valeur par défaut du composant `SoftAurora` — centrée verticalement) au lieu de `0.7` (`profile`/`catalogue`, bande repositionnée plus haut pour un hero top-heavy) : `/auth` centre sa carte verticalement dans le viewport (`items-center justify-center`), la bande aurora devait donc rester centrée avec elle plutôt que décalée vers le haut — sur demande explicite ("centrer l'animation"). La carte de connexion (`bg-surface-container-lowest` + `border-white/10` uni) passe à `.glass-card` (fond translucide flouté + `border-glass`, cf. section 🎨 Fond & texte de base) — même traitement que le bouton retour (`← Retour au portfolio`, déjà `glass-card` depuis l'origine) et le tiroir burger (cf. section Navigation mobile).

`PersonaSwitcher.tsx` (dev tool, cf. `CLAUDE.md`) abandonne ses couleurs brutes (`bg-black/40`) pour le token `bg-surface-container`, cohérent avec le reste de l'app. Le libellé devient dynamique — `Personas · Dev` en local, `Personas · Preview` sur une preview Vercel — pour qu'il soit sans ambiguïté qu'on n'est jamais en train de regarder la vraie prod quand ce bouton est visible.

## 🧭 Couleurs de nav active + badges (dashboard admin, `NAV_ACTIVE_CLASSES`, 13/07)

Chaque section a sa propre paire fond/icône pour l'état actif de la sidebar. Tous les ratios ci-dessous sont ≥ 4.5:1 (texte normal, calcul WCAG 2.1 sur les valeurs dark) :

| Section | Nav actif — fond | Nav actif — icône | Ratio icône |
|---|---|---|---|
| Dashboard | `primary-container` tinté 10% | `primary` | déjà vérifié (palette teal) |
| Catalogue projets | `tag-design-type` (fuchsia `#D946EF`) tinté 15% sur `surface` | `tag-design-type` plein | 4.59:1 |
| Demandes d'accès | `secondary` tinté 10% | `secondary` | ~3.25:1 (seuil UI 3:1, pas seuil texte — label jamais coloré, cf. plus haut) |
| Messages (Contacts) | Tailwind `indigo-500` tinté 10% (raw, pas un token sémantique) | `tag-keywords` `#818CF8` | 6.20:1 |
| Veille Hebdo | `tag-sector` tinté 10% | `tag-sector` | — |
| Paramètres | `primary-container` tinté 10% | `primary` | déjà vérifié (palette teal) |

**Badges de notification unifiés (15/07)** : les paires fond/texte par section (une par couleur de nav, documentées ci-dessous jusqu'au 13/07) sont abandonnées sur demande explicite — tous les badges de comptage (items de la sidebar admin **et** cloche `NotificationBell` du header) partagent désormais un seul composant, `NotificationCountBadge` (`src/components/NotificationCountBadge.tsx`, `bg-secondary`/`text-on-secondary`, `h-4 min-w-4`). `NAV_ACTIVE_CLASSES` ne porte donc plus que `bg`/`icon` par section, `badgeBg`/`badgeText` ont été retirés.

**Paramètres réaligné sur Dashboard (14/07)** : nav actif + `SectionAurora` de l'onglet passent de `indigo`/`tag-keywords` à `teal`/`primary`, sur demande explicite pour matcher exactement l'accent de Vue d'ensemble — identique ligne pour ligne à la ligne Dashboard ci-dessus. L'entrée `NAV_ACTIVE_CLASSES.indigo` (et `SECTION_AURORA.indigo`) reste définie dans le code mais n'est plus référencée par aucun onglet — non supprimée par prudence, à nettoyer si confirmé définitivement inutile.

Pour chaque item de nav actif : fond `bg-{teinte}/10` + icône `text-{teinte}`, mais le **libellé reste `text-on-surface`** (jamais coloré) — `secondary` (#7C3AED) mesuré à ~3.25:1 sur le fond `background` de la sidebar, sous le seuil AA texte (4.5:1) bien qu'au-dessus du seuil UI/icône (3:1). Plutôt que de traiter Demandes différemment des 3 autres sections, la même règle (icône colorée / libellé neutre) s'applique uniformément aux 4 — cohérence visuelle et zéro risque de contraste, y compris pour cyan/indigo dont le texte aurait pourtant été safe seul.

**Exception (13/07)** : `bg-aurora-cyan` réutilisé en tint plat (pas l'effet `.aurora-bg` animé multi-blob) sur le conteneur de contenu de l'onglet admin "Veille Design" (`AdminPage.tsx`) — seul onglet admin avec une teinte de section, distinct de teal/primary (état actif nav) et violet/secondary (couleur du badge de notification).

---

## 📱 Navigation mobile (17/07)

Refonte complète — avant cette session, `< md` (768px) n'affichait quasi rien dans `Header.tsx` (nav `hidden md:flex` sans repli mobile). `md` reste le seul seuil mobile/desktop de toute la feature, partout.

**Header mobile (`Header.tsx`)** — une seule barre pour pages publiques ET dashboard admin, seul le centre change. **Layout revu le 28/08** (voir bloc "Refonte menu Folio+" ci-dessous) : logo à gauche, groupe thème/compte/burger à droite (avant cette date, le burger était seul à gauche et le logo au centre) :
- Gauche : logo "Folio+" (pages publiques) ou texte fixe "Dashboard" (`isAdminRoute`, jamais dynamique par onglet)
- Droite : bouton thème (`MobileThemeSheet`) + avatar → `MobileAccountSheet` (connecté) ou lien "Connexion" (visiteur anonyme) + hamburger animé (`.hamburger-bars`) → `BurgerMenu`

**Refonte menu Folio+ (28/08)** — trois volets :

1. **Hamburger→croix animé** (`.hamburger-bars`/`.bar`, `styles.css`) : composant adapté d'un snippet Uiverse.io (à l'origine piloté par un `<input type="checkbox">` + sélecteur `:checked ~`) vers un état React (`burgerOpen`, `Header.tsx`) piloté par un attribut `data-open` sur le conteneur — pattern préféré à `:checked ~` pour rester cohérent avec le reste de la codebase (aucun composant n'utilise de checkbox cachée comme état ailleurs). Trois barres (`<span className="bar" />`), transition `cubic-bezier(0.37, -1.11, 0.79, 2.02)` (rebond, valeurs reprises telles quelles du snippet source) : barre 1 → `translateY(7px) rotate(45deg)`, barre 2 → `opacity: 0`, barre 3 → `translateY(-7px) rotate(-45deg)`. Remplace l'icône `Menu`/`X` Lucide statique du burger (les autres boutons icône-seule du header, thème et compte, restent Lucide).
2. **`BurgerMenu.tsx` — tiroir plein écran** : `SlideSheet` reçoit plusieurs props pour ce cas précis — `widthClassName="w-full"` (au lieu du tiroir 70% par défaut, cf. table `SlideSheet` ci-dessus) et `durationClassName="duration-300"`/`durationMs={300}` (au lieu de `duration-[var(--duration-drawer)]`/250ms par défaut) pour synchroniser l'animation d'entrée du tiroir avec celle du bouton hamburger→croix qui le déclenche (300ms). Contenu : le **nom du designer remplace le wordmark "Folio+"** — `{designer.fullName}` en `font-display-accent` (Lora italic 500, cf. section Typographie) `text-primary-container` (teal plus saturé, `#2DD4BF` dark — choisi plutôt que `primary`/`#57F1DB` pour rester cohérent avec la couleur de marque déjà utilisée sur les CTA, cf. règle de mapping M3 en tête de ce document), puis les liens Profil/Projets en grand centré (`text-4xl font-medium`, échelle proche de `headline-xl`/`display-accent` plutôt que la nav desktop `text-sm`).

   **État actif aligné sur la nav desktop (28/08, retouche)** : `BurgerLink` (mobile) n'avait au départ qu'un changement de couleur de texte pour l'état actif (`text-primary`), contrairement à `VisitorLink` (nav desktop, `Header.tsx`) qui a en plus un fond teinté — `bg-primary/15 font-bold text-primary` vs `font-medium text-on-surface-variant hover:text-primary` pour l'état inactif. Sur demande explicite ("le même que le menu desktop"), `BurgerLink` reprend exactement ce même couple de classes — un seul pattern d'état actif pour les liens de nav visiteur, des deux côtés du breakpoint `md`.

   **Fond glass + entrée bouncy (28/08, retouche)** : le fond neutre uni d'origine (`bg-surface-container-lowest`, défaut `SlideSheet`) est remplacé par le fond translucide flouté de `.glass-card` (cf. section 🎨 Fond & texte de base) via la nouvelle prop `panelClassName` — `bg-[color-mix(in_oklab,var(--surface-container-low)_70%,transparent)] backdrop-blur-md` (même valeur que `.glass-card`, exprimée en classe Tailwind arbitraire pour rester overridable via `cn()`/tailwind-merge plutôt que dupliquer une classe CSS). **La bordure reste `border-white/15`, défaut `SlideSheet` inchangé** — un essai avec `border-[color:var(--border-glass)]` (couleur de `.glass-card`) a été retenté puis annulé le jour même : contre le fond flouté, cette bordure plus discrète en valeur absolue (alpha 0.1 vs 0.15) paraissait visuellement plus marquée (le flou crée une transition nette avec le contenu de page derrière), sur demande explicite de revenir à la bordure d'avant. `showAuroraBackground={false}` (halo Aurora désactivé, décision d'origine, inchangée) reste en place — le flou du fond glass suffit à détacher visuellement le tiroir du contenu de page derrière, sans halo coloré animé en plus. Entrée animée avec `bouncy` (nouvelle prop `SlideSheet`, scale 95%→100% + easing overshoot `cubic-bezier(0.34,1.56,0.64,1)` au lieu du `ease-out` linéaire) pour que le tiroir semble se détacher/rebondir hors du fond plutôt que glisser platement, sur demande explicite ("comme si il se détachait du fond").

   **Plus de bouton de fermeture dédié dans le tiroir (28/08, retouche)** : le `X` Lucide en haut à droite du tiroir a été retiré — sur demande explicite, l'élément hamburger→croix du header doit être **le même contrôle, au même endroit**, pas dupliqué à un autre emplacement une fois le tiroir ouvert. Le tiroir passe donc en `zIndexClassName="z-40"` (nouvelle prop `SlideSheet`, défaut `z-[1000]`) — sous le header `z-50` — pour que celui-ci (avec son bouton déjà morphé en croix) reste visible et cliquable par-dessus le tiroir au lieu d'être recouvert par son overlay. Un spacer `h-20` (80px, hauteur approximative du header mobile) en tête du contenu du tiroir évite que les liens de nav ne démarrent sous le header. Fermeture alternative : Échap ou clic sur l'overlay (`closeOnBackdropClick`, inchangé). Cette prop `zIndexClassName` est spécifique au burger — les autres consommateurs de `SlideSheet` (thème, compte, filtres) gardent le défaut `z-[1000]` (au-dessus du header), leur fermeture n'étant pas liée à un bouton du header qui doit rester visible.
3. **Header desktop — fond au scroll** (`Header.tsx`, `SCROLL_THRESHOLD = 30`) : le header desktop (`< md` non concerné, cf. bloc mobile ci-dessus) est `fixed`, transparent et sans bordure au chargement (`border-transparent bg-transparent`) pour ne pas gêner la lecture du hero ; au-delà de 30px de scroll (`window.scrollY`, écouteur `passive: true`), il passe à `border-border-glass bg-surface/90 backdrop-blur-md`, transition `duration-[var(--duration-standard)] ease-signature` (200ms). Seuil choisi assez bas pour réagir dès le tout début du scroll plutôt qu'après une distance significative. **Couleur de bordure corrigée le 28/08 (retouche)** : `border-outline` (token générique de séparateur) → `border-border-glass` (même token `--border-glass` que `.glass-card`, exposé en utilitaire Tailwind via `--color-border-glass` dans `@theme inline`, cf. section 🎨 Fond & texte de base) — sur demande explicite, pour que la bordure basse du header corresponde exactement à celle des cards plutôt qu'à la bordure neutre générique.

Bouton thème et compte **restent dans le header** à côté du hamburger (décision explicite, alternative — les déplacer dans le tiroir burger — écartée pour ne pas ajouter de clic supplémentaire à des actions fréquentes).

**`SlideSheet`** (`src/components/SlideSheet.tsx`) — primitive partagée, trois variantes :
| | `from="bottom"` (thème, compte) | `from="left"` (burger) | `from="right"` (filtres, 11/08) |
|---|---|---|---|
| Usage | Feuille plein écran (100% × 100%) | Tiroir 70% largeur | Tiroir 70%/50% largeur (`widthClassName` overridable) |
| Fermeture clic-extérieur | Non (pas de zone visible "à l'extérieur") | Oui (`closeOnBackdropClick`) | Oui (`closeOnBackdropClick`) |
| Overlay | `bg-background/60 backdrop-blur-sm` | idem + bordure `border-r border-white/15` sur le tiroir | idem + bordure `border-l border-white/15` sur le tiroir |

Animation d'entrée ~250ms (`translate-y-full→0`, `-translate-x-full→0` ou `translate-x-full→0` selon la variante), Échap + blocage du scroll body communs aux trois variantes. `AuroraBackground variant="modal"` monté une seule fois par pile — retiré du tiroir de filtres (`FilterBar`/`AdminFilterBar`, cf. section Aurora, "Retiré des drawers") **et du burger** (28/08, `showAuroraBackground={false}`, cf. bloc "Refonte menu Folio+" ci-dessous) mais toujours présent sur les feuilles thème/compte.

**Props optionnelles ajoutées le 28/08** (défauts inchangés, donc aucun consommateur existant affecté) : `durationClassName` (défaut `duration-[var(--duration-drawer)]`) et `durationMs` (défaut `250`, doit rester cohérent avec `durationClassName` — piloté le délai de démontage post-fermeture) permettent à un tiroir de synchroniser son timing avec un déclencheur externe qui a son propre rythme d'animation ; `showAuroraBackground` (défaut `true`) permet de désactiver le montage d'`<AuroraBackground variant="modal" />`. Trois props supplémentaires (même jour, retouche ultérieure) : `panelClassName` (fusionné via `cn()`/tailwind-merge sur les classes du panneau — permet de remplacer `bg-surface-container-lowest`/`border-white/15` par défaut par un style spécifique à une instance, ex. fond glass) ; `bouncy` (défaut `false` — active scale 95%→100% + easing overshoot `cubic-bezier(0.34,1.56,0.64,1)` sur l'entrée/sortie, au lieu du slide `ease-out` linéaire) ; `zIndexClassName` (défaut `z-[1000]`, override du z-index racine — utile pour qu'un élément fixe d'une autre couche, ex. le header `z-50`, reste visible par-dessus le tiroir). Seul `BurgerMenu` (tiroir plein écran, `w-full`) utilise ces six props pour l'instant — `MobileThemeSheet`/`MobileAccountSheet`/`FilterBar`/`AdminFilterBar` restent sur tous les défauts.

**Tiroir de filtres passé à droite (`FilterBar`/`AdminFilterBar`, 11/08)** : `from="left"` → `from="right"`, pour ne pas chevaucher le burger menu (aussi `from="left"`) côté gauche de l'écran. Le bouton "Filtrer" en pied de tiroir (dupliquait la fermeture — `onClick={() => setExpanded(false)}`, aucun rôle de validation puisque chaque pill applique son filtre immédiatement au clic) a été retiré ; la fermeture reste possible via le X en en-tête, le clic sur l'overlay, ou Échap. Sur `FilterBar` (catalogue public), le bouton "Filtrer" + son séparateur sont sortis du conteneur `overflow-x-auto` du carrousel de types — ils restent fixes, seul le carrousel de pills scrolle désormais entre le séparateur et le bord de la fenêtre (`min-w-0 flex-1`, nécessaire pour qu'un enfant flex respecte `overflow-x-auto` au lieu de s'étirer). Corrige au passage un clip vertical du badge de comptage (`-top-1`, débordait du conteneur — `overflow-x-auto` force `overflow-y` à `auto` par défaut CSS, un enfant positionné en négatif au-dessus se faisait couper) : le badge n'est plus dans un conteneur à overflow contraint. `AdminFilterBar` (dashboard admin) garde sa structure carrousel d'origine (bouton inclus dans le scroll, correctif de padding `max-md:pt-1` à la place) — non restructuré dans cette passe, à aligner sur `FilterBar` si demandé.

**`useThemeMode`** (`src/hooks/useThemeMode.ts`) — état thème extrait de `ThemeToggle.tsx` pour être partagé avec `MobileThemeSheet` (seule source de vérité, plus de risque de désync entre dropdown desktop et feuille mobile). Toujours verrouillé sur `dark` (cf. section Light mode ci-dessous), Clair/Système désactivés avec `ComingSoonBadge` dans les deux variantes.

**`MobileAccountSheet`** — Dashboard (admin) ou Mon compte (`pending`/`validated_visitor`) → Notifications (drill-in `MobileNotificationsView`, même sheet, pas d'empilement) → Préférences (admin uniquement, remplace l'entrée Paramètres retirée de la bottom nav) → Déconnexion ancrée en bas. Aucun item n'est coloré (liste standard, `text-on-surface`) — contrairement à la bottom nav ci-dessous.

**`MobileNotificationsView`** — branchée sur la table `notifications` existante (`notifications_select_own`/`notifications_update_own`, trigger `access_requests_notify`) via `src/data/notifications.ts`, **aucune migration**. `notificationLabel()` extrait pour être partagé avec `NotificationBell.tsx` (desktop) — un seul format de libellé partout. Admin voit `access_request_received` → "Accéder au dashboard" (`/admin?tab=demandes`) ; visiteur voit `access_request_resolved` → "Voir le projet" (`/{slug}/projects?notif={id}`), marque `read_at` au clic avant de naviguer.

**`AdminMobileBottomNav`** — remplace `AdminSidebar` sur mobile (sidebar desktop passée en `hidden md:flex`, plus jamais affichée en version étroite icône-seule comme avant cette session). 5 entrées (Paramètres exclu, cf. `MobileAccountSheet`) : Dashboard, Catalogue projets, Demandes d'accès, Messages, Veille Hebdo. Couleurs/badges repris tels quels de `NAV_ACTIVE_CLASSES` (bg + icône par section, même palette que la table ci-dessus) — libellé toujours `text-on-surface`, jamais coloré, cohérent avec la sidebar desktop. Badges `h-5 w-5 text-[10px]` (plus grands que le `h-4` desktop, cible tactile). Barre : `bg-background/80 backdrop-blur-md`, `rounded-t-2xl`, item actif avec fond teinté (pas seulement l'icône).

**Convention "mobile-only" (confirmée explicitement par l'utilisatrice)** : toute retouche visuelle demandée sur une capture mobile ne s'applique qu'en dessous de `md` — jamais par défaut au desktop. Quand la mise en page mobile diffère structurellement du desktop (pas juste une classe en plus), dupliquer le bloc JSX avec `md:hidden` / `hidden md:flex` plutôt que de forcer un seul arbre DOM à travers les deux breakpoints avec des overrides fragiles. Exemples : `QuickAccessCard` (icône+texte côte à côte + flèche 24px toujours visible sur mobile vs. icône puis texte empilés + flèche 18px révélée au survol sur desktop, `AdminPage.tsx`), `ContactSummaryLine` (email sur sa propre ligne tronquée sur mobile, `title` conservant l'adresse complète, vs. ligne unique desktop inchangée — troncature à 28 caractères par défaut (`truncateEmail`, prop `emailMaxLength` optionnelle), portée à 33 pour les cartes "Demandes d'accès" et "Messages reçus" (`DemandesTab`/`ContactsTab`) le 19/07).

**Retour tactile (pressed state) et ajustements cartes (19/07)** :
- **Filet de sécurité global** (`styles.css`, `@layer base`) : tout `button`/`[role="button"]`/`a[href]` sans `active:*` Tailwind dédié reçoit `transform: scale(0.96)` + `opacity: 0.75` au `:active`, uniquement sous `md` (`@media (max-width: 767px)`, desktop inchangé — le survol suffit déjà). Spécificité volontairement basse (sélecteur d'élément) pour céder face à un `active:scale-95` déjà présent sur un composant (ex. boutons "Traiter" du Dashboard) — même logique de filet que le fallback `focus-visible` déjà en place.
- **Footer** (`Footer.tsx`) : les 3 liens passent en colonne centrée pleine largeur sous `md` (`flex-col items-center text-center w-full`), repli `md:flex-row` inchangé au-dessus.
- **Card "Messages reçus"** (`ContactsTab`) : message affiché en entier sur mobile (plus de `line-clamp-2` local en `style` inline), clamp à 2 lignes réintroduit uniquement à partir de `md` (`md:line-clamp-2`, classe Tailwind standard — déjà utilisée sur `ProjectCard`).

**Overlays et filtres mobile (17/07)** :
- **Tiroirs latéraux type `ProjectDrawer`** (`ProjectDrawer.tsx` + les 3 asides en lecture seule d'`AdminPage.tsx` : suivi des accès confidentiels accordés, "Mes contacts Folio+", détail d'une entrée Veille) — tous calqués sur le même `absolute right-0 top-0 h-screen w-[54vw]` desktop, aucun n'avait de repli mobile. Fix uniforme : `inset-x-4 top-0 bottom-0 rounded-2xl border` (flottant, marge 16px de chaque côté, hauteur pleine) sous `md`, `md:inset-x-auto md:right-0 md:h-screen md:w-[54vw] md:rounded-none md:border-0 md:border-l` au-dessus — un seul jeu de classes responsive, pas de duplication JSX (juste une largeur/position, pas une structure différente). `overflow-hidden` ajouté pour que le `rounded-2xl` mobile clippe proprement le contenu.
- **Footer de boutons** (`ProjectDrawer` — footer principal + les 2 confirmations imbriquées `pendingSave`/`confirmClose —, `AccessRequestModal`, confirmation de suppression `AdminPage`) : `flex-col-reverse` sous `md` (l'action principale, dernière dans le DOM, remonte visuellement en haut sans réordonner le JSX) + chaque bouton `w-full md:w-auto`, redevient `md:flex-row` (ordre desktop inchangé) au-dessus.
- **`FilterBar`/`AdminFilterBar`** (catalogue public + tous les filtres admin) : la rangée de pills principale passe en scroll horizontal sous `md` (`overflow-x-auto whitespace-nowrap` + nouvelle classe utilitaire `.scrollbar-hide` dans `styles.css`, scrollbar masquée mais scroll fonctionnel), reprend `md:flex-wrap md:overflow-visible` au-dessus. Le bouton "Filtrer" (catégories secondaires) — `AdminFilterBar` garde son panneau inline sous la barre en desktop (`hidden md:flex`) + `SlideSheet from="left"` (`md:hidden`) en dessous de `md`, deux rendus du même bloc de pills, un seul état `expanded` partagé, jamais les deux montés visibles en même temps. `SlideSheet` a une prop `className` optionnelle pour ce genre de cas (variante mobile-only d'un composant qui a aussi une variante desktop distincte).
  **`FilterBar` (catalogue public uniquement, 19/07)** : le panneau inline desktop a été retiré — `SlideSheet` sert désormais aussi bien sur desktop que mobile, plus de duplication de bloc de pills ni de state à synchroniser. `SlideSheet` a gagné une seconde prop optionnelle, `widthClassName`, pour ce cas précis : le tiroir gauche fait `w-[70%]` par défaut (pensé pour mobile, cf. `BurgerMenu`), disproportionné en plein écran desktop. `FilterBar` passe `widthClassName="w-[70%] md:w-1/2"` — mobile inchangé, 50 % de la largeur d'écran sur desktop (ajusté depuis une première valeur fixe `md:w-[380px]`, jugée trop étroite). Le bouton "Filtrer" du pied de tiroir reprend désormais exactement le style des autres boutons primary `px-5 py-2.5` du site (`shadow-lg shadow-primary/20 hover:scale-105 active:scale-95`, alignés sur `AuthPage`) au lieu d'un style `active:scale-[0.98]` ad hoc sans ombre.

---

## ✍️ Typographie (identique dark/light — seule la couleur change)

| Niveau | Police | Poids | Taille | Usage |
|---|---|---|---|---|
| `display-accent` | Lora | Italic 500 | 80px | Un seul mot-clé par écran |
| `headline-xl` | Outfit | 500 | 64px | — |
| `headline-lg` | Outfit | 500 | 40px (32px mobile) | — |
| `body-md` | Outfit | 300 | 18px | — |
| `body-lg` | Outfit | 300 | 22px | — |
| `label-caps` | Outfit | 500 | 12px, uppercase, tracking 0.1em | Nav, badges, tags — **jamais** labels de formulaire |
| `numbering` | Outfit | 500 | 14px | Milestones |

Toutes les tailles doivent utiliser des unités `rem`/classes Tailwind, jamais de `px` en dur (zoom navigateur 200%, exigence RGAA/8.3 PRD).

Import : `fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Lora:ital,wght@1,500`

> **Remplacement Cormorant Garamond → Lora (27/08)** : testé d'abord sur `ProfilePage.tsx` seul (classe `.font-accent-test` isolée, `--font-display-accent` inchangée ailleurs), validé puis généralisé à toute l'app en changeant uniquement la valeur de `--font-display-accent` dans `styles.css` (`.font-display-accent` reste italic/500, seule la police change) — les 8 usages (`AdminPage.tsx` ×2, `CataloguePage.tsx`, `ProfilePage.tsx`, `ProjectDetailPage.tsx` ×3, `NotFoundPage.tsx`) en héritent automatiquement, aucun n'a été touché individuellement. Cormorant Garamond retiré de l'import Google Fonts (`index.html`) — plus aucun usage dans le code (`--font-serif` référence encore son nom en valeur de repli théorique, mais la classe `font-serif` n'est utilisée nulle part).

---

## 📐 Spacing & Shapes (identique dark/light)

`unit` 8px · `gutter` 24px · `margin-mobile` 20px · `margin-desktop` 64px · `container-max` 1440px · `section-gap` 80px.

`rounded-full` sur boutons, tags, badges, pills. `rounded-xl`/`rounded-2xl` sur blocs de contenu (cards, alertes, hero images). Aucun angle dur.

**Exception — portrait hero page Profil (28/08)** : le conteneur du portrait (`ProfilePage.tsx`, `.aspect-square overflow-hidden`) n'utilise plus `rounded-[48px]` mais une forme organique type "galet" (`border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%`, en `style` inline — syntaxe non exprimable en classe Tailwind standard), sur demande explicite avec image de référence. Ne pas généraliser sans nouvelle demande (le reste des hero images/cards garde les coins standard).

**Exception — hero plein écran page Détail projet (01/09)** : le hero de `ProjectDetailPage.tsx` (`aspect-[3/1]`, `aspect-[4/3]` mobile) est désormais **edge-to-edge** (pleine largeur, avant `<main>`, démarre au tout haut de la page, derrière le header transparent au chargement) — plus de `rounded-2xl`, cohérent avec le fait qu'un bloc qui touche les bords du viewport n'a plus de coin visible à arrondir. Deuxième et seule autre dérogation à la règle `rounded-xl`/`rounded-2xl` des hero images — chacune scopée à son cas précis, ne pas généraliser.

---

## 🎯 Iconographie

**Librairie : Lucide** (`lucide-react`, déjà installé) uniquement.

| Critère | Valeur |
|---|---|
| Épaisseur | 1.5px, uniforme toutes tailles (`.lucide { stroke-width: 1.5 }`, `styles.css`, surcharge globale — plus d'exception 2px sous 16px) |
| Tailles | 14-16px (inline/filtres) · 18-20px (UI, alertes) · 24px (nav/titres) · 32px+ (états vides) |
| Couleur neutre | `on-surface` / `on-surface-variant` |
| Couleur active/marque | `primary` sur fond `surface` — jamais sur `primary-container` |
| Confidentialité | `violet-confidential` — `Lock`/`LockOpen` uniquement |
| Angles | variante `round` toujours |

---

## ♿ Accessibilité — points non-négociables (hors passe RGAA dédiée)

Une passe d'audit RGAA complète sur toute l'application est prévue séparément. Ces points sont déjà appliqués car quasi gratuits à intégrer dès l'écriture d'un composant — ne pas les reporter :

- `focus-visible` (ring clavier) sur tout élément interactif (pills, boutons, liens)
- `cursor: pointer` systématique (`styles.css`, `@layer base` — `button`/`[role="button"]`/`a[href]`/`select`/`label[for]`/checkbox/radio) : règle globale, jamais à poser au cas par cas sur un composant
- Unités `rem`/classes Tailwind, jamais de `px` en dur pour le texte
- Ne jamais coder une information uniquement par la couleur (toujours doubler avec forme, icône ou texte)
- Labels de formulaire : jamais `uppercase`, toujours Sentence case
- Contraste : seuil 4.5:1 texte, 3:1 composants UI/bordures — déjà vérifié pour tous les tokens de ce document

### ⚠️ `transition-all` casse le ring `focus-visible` (piège CSS, 16/07)

Repéré lors de la vérification en conditions réelles (DevTools, pas juste lecture du code) : sur tout élément combinant `transition-all` et `focus-visible:ring-2 ring-primary ring-offset-*`, le `box-shadow` composé par les utilitaires ring restait figé sur ses calques transparents — anneau de focus invisible en pratique, alors que le code semblait correct (classes présentes, `:focus-visible` bien actif, variables `--tw-ring-shadow`/`--tw-ring-offset-shadow` correctement calculées). Reproduit sur un élément DOM isolé, hors de tout composant — pas un bug applicatif ponctuel, ni un artefact de timing (persiste indéfiniment, pas seulement pendant la transition). `transition-colors`/`transition-transform` n'incluent pas `box-shadow` et ne sont pas affectés.

**Corrigé une fois pour toutes** via une règle globale hors `@layer` dans `styles.css` (gagne sur la couche `utilities` de Tailwind sans toucher les 37 usages de `transition-all` dispersés dans 22 fichiers) : `.transition-all` exclut désormais `box-shadow`/`background-image` de ses propriétés transitionnées. Aucun composant ne dépendait d'une transition douce du box-shadow lui-même (vérifié avant correctif). **Ne pas réintroduire** un `transition-shadow`/`transition` (raccourci Tailwind, inclut aussi `box-shadow`) sur un élément portant un `focus-visible:ring-*` sans re-tester le rendu réel du ring au clavier.

---

## ✅ État & checklist

**Dark mode** : ✅ conforme AA. Mapping primary/primary-container corrigé, badges d'accès (4 états), filtres par catégorie, système d'alertes, token warning ajouté.

**Light mode** : ⏳ à faire. `primary`/`secondary`/`tertiary` et variantes héritent silencieusement du dark. `warning` n'a pas encore de valeur light. Valeurs cibles = colonnes "Light" de ce document.

**À trancher** : divergence `secondary` = `#7c3aed` (code) vs `#D2BBFF` (cible M3 dark).

**Ne pas toucher** : shadcn/ui sous `src/components/ui/` = code mort.

Checklist Claude Code pour le light mode :
- [ ] Définir en light tous les tokens de marque manquants (primary, secondary, tertiary + variantes)
- [ ] Calculer la valeur light du token `warning`
- [ ] Vérifier qu'aucun token de marque n'hérite plus du dark en light
- [ ] Retester filtres, badges d'accès et alertes en light avec PersonaSwitcher
- [ ] `grep -rn "bg-primary\b" src/` (hors ui/) doit rester vide
