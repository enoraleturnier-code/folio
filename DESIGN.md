# Folio+ — Design System (Dark + Light)

Document de référence **unique** pour l'implémentation des tokens couleur dans Claude Code (Tailwind v4, `src/styles.css`, `:root` / `.dark`). Nomenclature Material 3. Tous les ratios sont vérifiés programmatiquement (WCAG 2.1), pas estimés.

**Dernière mise à jour** : 12 juillet 2026 — passe de finitions UI (branche `style/ux-ui-ameliorations`) : badges et boutons resserrés, titres de page harmonisés, modales de confirmation standardisées (icône + fond boréal + ombre), fonds boréals différenciés par page/section admin. Voir les sections dédiées plus bas. Avant ça : section badges d'accès F-12 corrigée (11/07). Reste : dark mode conforme AA + système de filtres, badges d'accès et alertes.
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
- Taille de l'accent : ne dépasse jamais le texte principal (contrainte dure). Là où l'accent avait déjà sa propre classe de taille plus petite que le titre (`CataloguePage.tsx`), remonté d'un cran pour se rapprocher du titre sans le dépasser. Là où l'accent héritait déjà de la même taille que le titre (`ProjectDetailPage.tsx`, `ProfilePage.tsx`, `NotFoundPage.tsx`, `AdminPage.tsx`), déjà au plafond — pas de changement possible sans violer la contrainte.

**Harmonisation de taille** (visiteur uniquement — dashboard admin explicitement exempté) : `ProfilePage`/`CataloguePage`/`ProjectDetailPage` alignés sur un même palier desktop `md:text-6xl` pour le titre principal (`CataloguePage` était `md:text-7xl`, redescendu). Les tailles mobile (`text-4xl`/`text-5xl` selon la page) restent volontairement différenciées — cf. `headline-lg` (40px desktop / 32px mobile) qui autorise déjà cet écart mobile dans ce document. `AdminPage` (dashboard admin) garde sa propre échelle (`text-4xl md:text-5xl`), non touchée par cette harmonisation.

---

## ⚠️ Formulaires — icône d'erreur sur les champs (12/07)

Pattern déjà en place sur `AccessRequestModal` (`FieldHint`, icône `CircleAlert` + texte `text-error` sous le champ) répliqué partout où un champ peut être en erreur :

- `ProjectDrawer.tsx` (`fieldError()`) — ajoutait déjà le message d'erreur mais sans icône, désormais `CircleAlert size={14}` + `role="alert"`, même style que `AccessRequestModal`.
- `AuthPage.tsx` — ajout d'une validation de champ minimale (email/mot de passe requis, au blur) qui n'existait pas du tout auparavant, avec le même traitement `CircleAlert`. L'erreur de connexion globale ("Email ou mot de passe incorrect") passe elle par le composant `Alert type="error"` (voir plus bas), pas par ce pattern de champ.
- `ContactForm.tsx` — idem, formulaire n'avait aucune validation autre que `required` HTML natif ; ajout d'un suivi `touched` par champ + icône `CircleAlert`.

**Non concerné, volontairement** : `AdminPage` → `ParametresTab` (aucun champ n'y est requis, rien à signaler) et le textarea "Motif du refus" de `DemandesTab` (déjà gaté par un bouton disabled, pas de pattern touched/error à dupliquer pour un unique champ) — pas de validation fabriquée artificiellement là où le formulaire n'en avait pas besoin.

---

## 🌌 Aurora (fond décoratif)

| Token | Light | Dark (opacités +2%) |
|---|---|---|
| `aurora-teal` | `rgba(10,122,106,0.10)` | ~12% |
| `aurora-purple` | `rgba(124,58,237,0.08)` | ~10% |
| `aurora-cyan` | `rgba(4,111,129,0.06)` | ~8% |
| `aurora-indigo` | `rgba(129,140,248,0.16)` | ~12% |

CSS-only (`.aurora-bg` + `AuroraBackground.tsx`), radial-gradient flouté. `aurora-indigo` ajouté le 12/07 (même valeur hex que `tag-keywords`, cf. section Tags) pour la 4ᵉ teinte du dashboard admin — aucune nouvelle couleur, seulement une variante translucide d'un token déjà existant.

**Variantes (`AuroraBackground` prop `variant`, 12/07)** — même famille de couleurs partout, seule la répartition change :

| Variant | Usage | Composition |
|---|---|---|
| `profile` (défaut) | Page profil public | 3 taches : teal en haut-gauche, purple en bas-droite, cyan centrée — composition d'origine |
| `catalogue` | Catalogue de projets | Mêmes 3 couleurs, réparties différemment (teal en haut-**droite** et plus petit, purple en bas-**gauche** et plus petit, cyan décalée à 30%/65% et plus large) — pour que les deux pages restent reconnaissables l'une de l'autre sans changer de palette |
| `modal` | Derrière chaque modale ouverte (`AccessRequestModal`, `ProjectDrawer`, confirmations `AdminPage`) | Même composition que `profile`, opacité des 3 taches réduite à 60 % — combinée à l'overlay `bg-background/80-90` + `backdrop-blur-sm` déjà en place, qui apporte le flou |

**Dashboard admin — un halo par section (`SectionAurora`, `AdminPage.tsx`, 12/07)** : une seule tache douce (`.aurora-section`, `position: absolute` dans le conteneur de la section — pas `position: fixed` plein écran comme `.aurora-bg`), couleur dominante différente par onglet, réutilise les 4 teintes déjà existantes :

| Section admin | Couleur | Token aurora | Cohérence nav (icône active) |
|---|---|---|---|
| Catalogue projets | teal | `aurora-teal` | `text-primary` (inchangé) |
| Demandes d'accès | violet | `aurora-purple` | `text-secondary` |
| Messages (Contacts) | cyan | `aurora-cyan` | `text-tag-sector` |
| Paramètres | indigo | `aurora-indigo` | `text-tag-keywords` |
| Vue d'ensemble (Dashboard) | — | aucun | `text-primary` (lien séparé, non concerné par le mapping par section) |

Pour chaque item de nav actif : fond `bg-{teinte}/10` + icône `text-{teinte}`, mais le **libellé reste `text-on-surface`** (jamais coloré) — `secondary` (#7C3AED) mesuré à ~3.25:1 sur le fond `background` de la sidebar, sous le seuil AA texte (4.5:1) bien qu'au-dessus du seuil UI/icône (3:1). Plutôt que de traiter Demandes différemment des 3 autres sections, la même règle (icône colorée / libellé neutre) s'applique uniformément aux 4 — cohérence visuelle et zéro risque de contraste, y compris pour cyan/indigo dont le texte aurait pourtant été safe seul.

---

## ✍️ Typographie (identique dark/light — seule la couleur change)

| Niveau | Police | Poids | Taille | Usage |
|---|---|---|---|---|
| `display-accent` | Cormorant Garamond | Italic 500 | 80px | Un seul mot-clé par écran |
| `headline-xl` | Outfit | 500 | 64px | — |
| `headline-lg` | Outfit | 500 | 40px (32px mobile) | — |
| `body-md` | Outfit | 300 | 18px | — |
| `body-lg` | Outfit | 300 | 22px | — |
| `label-caps` | Outfit | 500 | 12px, uppercase, tracking 0.1em | Nav, badges, tags — **jamais** labels de formulaire |
| `numbering` | Outfit | 500 | 14px | Milestones |

Toutes les tailles doivent utiliser des unités `rem`/classes Tailwind, jamais de `px` en dur (zoom navigateur 200%, exigence RGAA/8.3 PRD).

Import : `fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Outfit:wght@300;400;500`

---

## 📐 Spacing & Shapes (identique dark/light)

`unit` 8px · `gutter` 24px · `margin-mobile` 20px · `margin-desktop` 64px · `container-max` 1440px · `section-gap` 80px.

`rounded-full` sur boutons, tags, badges, pills. `rounded-xl`/`rounded-2xl` sur blocs de contenu (cards, alertes, hero images). Aucun angle dur.

---

## 🎯 Iconographie

**Librairie : Lucide** (`lucide-react`, déjà installé) uniquement.

| Critère | Valeur |
|---|---|
| Épaisseur | 1.5px · 2px sous 16px |
| Tailles | 14-16px (inline/filtres) · 18-20px (UI, alertes) · 24px (nav/titres) · 32px+ (états vides) |
| Couleur neutre | `on-surface` / `on-surface-variant` |
| Couleur active/marque | `primary` sur fond `surface` — jamais sur `primary-container` |
| Confidentialité | `violet-confidential` — `Lock`/`LockOpen` uniquement |
| Angles | variante `round` toujours |

---

## ♿ Accessibilité — points non-négociables (hors passe RGAA dédiée)

Une passe d'audit RGAA complète sur toute l'application est prévue séparément. Ces points sont déjà appliqués car quasi gratuits à intégrer dès l'écriture d'un composant — ne pas les reporter :

- `focus-visible` (ring clavier) sur tout élément interactif (pills, boutons, liens)
- Unités `rem`/classes Tailwind, jamais de `px` en dur pour le texte
- Ne jamais coder une information uniquement par la couleur (toujours doubler avec forme, icône ou texte)
- Labels de formulaire : jamais `uppercase`, toujours Sentence case
- Contraste : seuil 4.5:1 texte, 3:1 composants UI/bordures — déjà vérifié pour tous les tokens de ce document

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
