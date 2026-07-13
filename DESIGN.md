# Folio+ — Design System (Dark + Light)

Document de référence **unique** pour l'implémentation des tokens couleur dans Claude Code (Tailwind v4, `src/styles.css`, `:root` / `.dark`). Nomenclature Material 3. Tous les ratios sont vérifiés programmatiquement (WCAG 2.1), pas estimés.

**Dernière mise à jour** : 12 juillet 2026 — ajout des sections "États d'erreur de formulaire" et "Badge de statut avec suffixe" (voir plus bas). Avant ça, 11 juillet : section badges d'accès F-12 corrigée pour matcher l'implémentation réelle. Reste sinon : dark mode conforme AA + système de filtres, badges d'accès et alertes.
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

| État | Visuel | Interaction |
|---|---|---|
| **none** (pas de demande) | Thumbnail flouté + icône `Lock` en overlay. CTA plein `bg-primary-container` + `text-on-primary-container`, `rounded-full`, icône `KeyRound`, texte "Demander l'accès" | Carte entière cliquable → ouvre `AccessRequestModal`. |
| **pending** | Thumbnail flouté + icône `Loader2` animée (rotation CSS) en overlay. Composant `Alert` type `info` : "Demande en cours de traitement" | Carte inerte — pas de curseur pointer, pas de hover. |
| **refused** | Thumbnail flouté + icône `Lock` en overlay. Composant `Alert` type `warning` : motif du refus + lien "Contacter l'administrateur ?" vers la section contact de `/[slug]` | Carte inerte. Seul le lien "Contacter" a un état hover (soulignement), isolé du reste. |
| **granted** | Thumbnail net (pas de flou). Badge "Confidentiel · Accès validé" — fill plein `violet-confidential` + texte `white`, icône `LockOpen` | Carte = lien direct vers la fiche complète, pas de demande d'accès. |

Le badge 🔒 CONFIDENTIEL (classification, `StatusBadge kind="confidential"`) est **distinct** du badge de statut d'accès ci-dessus — il reste affiché sur none/pending/refused, remplacé uniquement par "Confidentiel · Accès validé" une fois l'accès obtenu.

Pas de pastille dédiée pour pending/refused : ces deux états réutilisent le composant `Alert` générique (voir section suivante), cohérent avec le reste de l'app plutôt qu'un style propre à cette carte.

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

## 🚫 États d'erreur de formulaire (validation, ProjectDrawer)

Introduit le 12/07 en remplaçant le pattern "bouton de soumission désactivé" (impossible pour l'utilisateur de savoir quel champ bloque) par un pattern "erreur trouvable" :

- **Contour du champ** : `border-error` (au lieu de `border-white/5`/`outline` par défaut) + `focus-visible:ring-error` (au lieu de `ring-primary`) tant que le champ a une erreur. Appliqué via `cn()`/`tailwind-merge` pour résoudre proprement le conflit avec la bordure de base.
- **Message d'erreur** : `text-error`, `text-xs`, précédé d'une icône Lucide `AlertCircle` (13px, `shrink-0`), alignés en `flex items-center gap-1`.
- **Formulation** : champ obligatoire vide → `"Le champ [Nom du champ] est obligatoire."` (libellé humain, pas le nom technique du champ). Dépassement de longueur → `"X/Y caractères max."` (message dédié, inchangé).
- **Pas de bouton désactivé** : le CTA principal ("Enregistrer et publier") reste cliquable même formulaire invalide — au clic, focus + scroll automatique vers le **premier champ en erreur selon sa position visuelle réelle** dans le formulaire (pas l'ordre de la fonction de validation, qui ne correspond pas à l'ordre des sections).
- S'applique à tout type de champ (texte, textarea, select, zone de dépôt d'image) — la zone de dépôt reçoit un `id`/`tabIndex={-1}` dédiés pour être focusable/scrollable comme un input classique.

---

## 🏷️ Badge de statut avec suffixe (dashboard admin uniquement)

`StatusBadge` accepte un prop optionnel `suffix?: string`, rendu en `normal-case` juste après le label (le label lui-même reste `uppercase`) : ex. `"CONFIDENTIEL • Sensible"`.

- **Usage unique** : la liste "Mon catalogue Projets" du dashboard admin (`AdminPage.tsx`), pour afficher le niveau de sensibilité (`Sensible`/`Très sensible`) des projets confidentiels non supprimés.
- **Ne pas généraliser** : les autres usages de `StatusBadge` (catalogue public via `ProjectCard.tsx`, onglets Accès/Messages) n'utilisent pas ce prop — le catalogue public affiche déjà l'info de sensibilité via son propre badge dédié ("Confidentiel • {sensibilité}", voir section F-12 ci-dessus), pas de doublon à créer.

---

## 🌌 Aurora (fond décoratif)

| Token | Light | Dark (opacités +2%) |
|---|---|---|
| `aurora-teal` | `rgba(10,122,106,0.10)` | ~12% |
| `aurora-purple` | `rgba(124,58,237,0.08)` | ~10% |
| `aurora-cyan` | `rgba(4,111,129,0.06)` | ~8% |

CSS-only, pages profil public et catalogue uniquement.

**Exception (13/07)** : `bg-aurora-cyan` réutilisé en tint plat (pas l'effet `.aurora-bg` animé multi-blob) sur le conteneur de contenu de l'onglet admin "Veille Design" (`AdminPage.tsx`) — seul onglet admin avec une teinte de section, distinct de teal/primary (état actif nav) et violet/secondary (couleur du badge de notification).

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
