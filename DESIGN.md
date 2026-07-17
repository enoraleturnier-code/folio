# Folio+ — Design System (Dark + Light)

Document de référence **unique** pour l'implémentation des tokens couleur dans Claude Code (Tailwind v4, `src/styles.css`, `:root` / `.dark`). Nomenclature Material 3. Tous les ratios sont vérifiés programmatiquement (WCAG 2.1), pas estimés.

**Dernière mise à jour** : 17 juillet 2026 — refonte navigation mobile (`< md`, 768px) : header mobile commun pages publiques/dashboard admin (burger + thème + compte), primitive `SlideSheet` (feuilles plein écran bas / tiroir gauche), `MobileThemeSheet`/`MobileAccountSheet` remplaçant les dropdowns desktop, `MobileNotificationsView` branchée sur la table `notifications` existante, `AdminMobileBottomNav` (5 entrées) remplaçant la sidebar admin sur mobile — voir section dédiée plus bas. Convention actée : toute retouche visuelle mobile ne s'applique jamais au desktop par défaut (dupliquer le JSX `md:hidden`/`hidden md:flex` si la mise en page diffère structurellement). Avant ça, 13 juillet : onglet "Veille Design Hebdo" renommé "Veille Hebdo" ; couleurs de nav active + badges de notification redéfinies par section (`NAV_ACTIVE_CLASSES`, dashboard admin) : fuchsia (Catalogue projets), tertiary-container plein (Messages), neutre `surface-container` (Paramètres) — voir table dédiée plus bas, halos `SectionAurora` volontairement laissés inchangés (dissociés de la nav désormais). Juste avant : amélioration du sidebar admin (fusion "Dashboard" dans la nav, tooltip custom en mode icône-seule, survol avec fond, badge `text-[10px]`, état replié persisté) + deux règles globales `styles.css` (`cursor: pointer` systématique, icônes Lucide uniformisées à `stroke-width: 1.5`, plus d'exception 2px sous 16px). Voir les sections dédiées plus bas. Avant ça, 12 juillet : passe de finitions UI (branche `style/ux-ui-ameliorations`) : badges et boutons resserrés, titres de page harmonisés, modales de confirmation standardisées (icône + fond boréal + ombre), fonds boréals différenciés par page/section admin, accent italique du dashboard admin agrandi au-delà du titre (retouche demandée après coup), puis deux passes successives de renforcement du fond aurora (alphas remontés à plusieurs reprises, 4ᵉ couleur indigo ajoutée à la composition principale, variant modal avec ses propres alphas plus marqués) ; en parallèle sur `main` : ajout des sections "États d'erreur de formulaire" et "Badge de statut avec suffixe". Avant ça : section badges d'accès F-12 corrigée (11/07). Reste : dark mode conforme AA + système de filtres, badges d'accès et alertes.
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

**Tokens de base (pages profil/catalogue)** :

| Token | Dark | Light |
|---|---|---|
| `aurora-teal` | `rgba(45,212,191,0.36)` | `rgba(45,212,191,0.3)` |
| `aurora-purple` | `rgba(124,58,237,0.32)` | `rgba(124,58,237,0.26)` |
| `aurora-cyan` | `rgba(6,182,212,0.28)` | `rgba(6,182,212,0.24)` |
| `aurora-indigo` | `rgba(129,140,248,0.3)` | `rgba(129,140,248,0.28)` |

**Variant `modal`** — mêmes 4 teintes, alphas propres et plus élevés (+20 à +36 % relatif selon la couleur), redéfinis localement sur `.aurora-bg--modal` (les 4 custom properties sont simplement réassignées dans ce scope, aucune règle dupliquée sur chaque pseudo-élément) :

| Token | Dark (modal) | Light (modal) |
|---|---|---|
| `aurora-teal` | `rgba(45,212,191,0.46)` | `rgba(45,212,191,0.4)` |
| `aurora-purple` | `rgba(124,58,237,0.42)` | `rgba(124,58,237,0.36)` |
| `aurora-cyan` | `rgba(6,182,212,0.38)` | `rgba(6,182,212,0.34)` |
| `aurora-indigo` | `rgba(129,140,248,0.4)` | `rgba(129,140,248,0.38)` |

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
| `modal` | Derrière chaque modale ouverte (`AccessRequestModal`, `ProjectDrawer`, confirmations `AdminPage`) + la page `/auth` (`AuthPage.tsx`, 15/07 — pas une modale à proprement parler, mais même traitement visuel pour la cohérence avec le reste de l'app) | Même géométrie que `profile`, alphas propres et plus marqués (table ci-dessus) — combinée à l'overlay `bg-background/80-90` + `backdrop-blur-sm` déjà en place, qui apporte le flou (sauf `/auth`, qui n'a pas d'overlay de dim puisqu'il n'y a rien derrière à assombrir) |

**Dashboard admin — un halo par section (`SectionAurora`, `AdminPage.tsx`, 12/07)** : une seule tache douce (`.aurora-section`, `position: absolute` dans le conteneur de la section — pas `position: fixed` plein écran comme `.aurora-bg`), couleur dominante différente par onglet, réutilise les 4 teintes déjà existantes :

| Section admin | Couleur halo | Token aurora |
|---|---|---|
| Catalogue projets | teal | `aurora-teal` |
| Demandes d'accès | violet | `aurora-purple` |
| Messages (Contacts) | cyan | `aurora-cyan` |
| Paramètres | teal (depuis le 14/07, était indigo) | `aurora-teal` |
| Vue d'ensemble (Dashboard) | — | aucun |

**⚠️ Depuis le 13/07, le halo de section (ci-dessus) et la couleur de nav active (ci-dessous) ne sont plus forcément la même teinte** — décision explicite, périmètres volontairement dissociés (ex. Messages : halo toujours cyan, nav désormais tertiary-container). Ne pas chercher à les réaligner sans nouvelle demande. **Exception : Paramètres**, dont halo et nav ont au contraire été réalignés (les deux en teal) le 14/07 sur demande explicite pour matcher Vue d'ensemble.

## 🔑 Page `/auth` + `PersonaSwitcher` (15/07)

`AuthPage.tsx` reçoit le même traitement que les autres surfaces de l'app : `AuroraBackground variant="modal"` en fond (cf. section Aurora ci-dessus), accroche renforcée ("Content de vous revoir" + sous-titre), lien de retour vers le portfolio public (`← Retour au portfolio`) et un renvoi vers la demande d'accès (`AccessRequestModal`, via le catalogue) pour les visiteurs sans compte — `/auth` reste **login-only**, aucune bascule "Sign up" (la création de compte passe exclusivement par le flux F-12). CTA "Se connecter" corrigé de `text-on-primary` vers `text-on-primary-container` (divergence à la règle M3 de ce document, déjà corrigée ailleurs mais oubliée ici).

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

**Header mobile (`Header.tsx`)** — une seule barre pour pages publiques ET dashboard admin, seul le centre change :
- Gauche : burger (`Menu` Lucide) → `BurgerMenu`
- Centre : logo "Folio+" (pages publiques) ou texte fixe "Dashboard" (`isAdminRoute`, jamais dynamique par onglet)
- Droite : bouton thème (`MobileThemeSheet`) + avatar → `MobileAccountSheet` (connecté) ou lien "Connexion" (visiteur anonyme)

**`SlideSheet`** (`src/components/SlideSheet.tsx`) — primitive partagée, deux variantes :
| | `from="bottom"` (thème, compte) | `from="left"` (burger) |
|---|---|---|
| Usage | Feuille plein écran (100% × 100%) | Tiroir 70% largeur |
| Fermeture clic-extérieur | Non (pas de zone visible "à l'extérieur") | Oui (`closeOnBackdropClick`) |
| Overlay | `bg-background/60 backdrop-blur-sm` | idem + bordure `border-r border-white/15` sur le tiroir |

Animation d'entrée ~250ms (`translate-y-full→0` ou `-translate-x-full→0`), `AuroraBackground variant="modal"` monté une seule fois par pile, Échap + blocage du scroll body communs aux deux variantes.

**`useThemeMode`** (`src/hooks/useThemeMode.ts`) — état thème extrait de `ThemeToggle.tsx` pour être partagé avec `MobileThemeSheet` (seule source de vérité, plus de risque de désync entre dropdown desktop et feuille mobile). Toujours verrouillé sur `dark` (cf. section Light mode ci-dessous), Clair/Système désactivés avec `ComingSoonBadge` dans les deux variantes.

**`MobileAccountSheet`** — Dashboard (admin) ou Mon compte (`pending`/`validated_visitor`) → Notifications (drill-in `MobileNotificationsView`, même sheet, pas d'empilement) → Préférences (admin uniquement, remplace l'entrée Paramètres retirée de la bottom nav) → Déconnexion ancrée en bas. Aucun item n'est coloré (liste standard, `text-on-surface`) — contrairement à la bottom nav ci-dessous.

**`MobileNotificationsView`** — branchée sur la table `notifications` existante (`notifications_select_own`/`notifications_update_own`, trigger `access_requests_notify`) via `src/data/notifications.ts`, **aucune migration**. `notificationLabel()` extrait pour être partagé avec `NotificationBell.tsx` (desktop) — un seul format de libellé partout. Admin voit `access_request_received` → "Accéder au dashboard" (`/admin?tab=demandes`) ; visiteur voit `access_request_resolved` → "Voir le projet" (`/{slug}/projects?notif={id}`), marque `read_at` au clic avant de naviguer.

**`AdminMobileBottomNav`** — remplace `AdminSidebar` sur mobile (sidebar desktop passée en `hidden md:flex`, plus jamais affichée en version étroite icône-seule comme avant cette session). 5 entrées (Paramètres exclu, cf. `MobileAccountSheet`) : Dashboard, Catalogue projets, Demandes d'accès, Messages, Veille Hebdo. Couleurs/badges repris tels quels de `NAV_ACTIVE_CLASSES` (bg + icône par section, même palette que la table ci-dessus) — libellé toujours `text-on-surface`, jamais coloré, cohérent avec la sidebar desktop. Badges `h-5 w-5 text-[10px]` (plus grands que le `h-4` desktop, cible tactile). Barre : `bg-background/80 backdrop-blur-md`, `rounded-t-2xl`, item actif avec fond teinté (pas seulement l'icône).

**Convention "mobile-only" (confirmée explicitement par l'utilisatrice)** : toute retouche visuelle demandée sur une capture mobile ne s'applique qu'en dessous de `md` — jamais par défaut au desktop. Quand la mise en page mobile diffère structurellement du desktop (pas juste une classe en plus), dupliquer le bloc JSX avec `md:hidden` / `hidden md:flex` plutôt que de forcer un seul arbre DOM à travers les deux breakpoints avec des overrides fragiles. Exemples : `QuickAccessCard` (icône+texte côte à côte + flèche 24px toujours visible sur mobile vs. icône puis texte empilés + flèche 18px révélée au survol sur desktop, `AdminPage.tsx`), `ContactSummaryLine` (email sur sa propre ligne tronquée à 28 caractères sur mobile, `title` conservant l'adresse complète, vs. ligne unique desktop inchangée).

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
