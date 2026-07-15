# Rapport de QA — Folio+

## Passage du 15/07/2026 (2e passage — après correctifs)

**Environnement testé** : production `folio-h3vni8j01-enora-le-turnier-s-projects.vercel.app` (`main`, commit `239cab1` / v0.14.2 — contient les 2 correctifs du 1er passage), accès via lien de bypass Vercel Authentication (`_vercel_share`, généré à la volée, jamais commit).
**Outil** : Playwright 1.61.1, mêmes specs que le 1er passage (`e2e/`), aucune modification de test nécessaire.
**Rôles testés** : anonyme, `pending` (Sophie), `validated_visitor` (Karim), `admin` (Léa).
**Couverture** : desktop (Chrome) + mobile (émulation Pixel 7) — 22 tests uniques × 2 plateformes.
**Preuves** : vidéo + capture + trace pour les 44 exécutions dans `test-results/`, rapport HTML agrégé généré avec succès cette fois (`npx playwright show-report`) — contrairement au 1er passage où il avait échoué à se générer.

### Résumé exécutif

**44 / 44 exécutions réussies, zéro erreur console JavaScript inattendue.** Les 2 bugs du 1er passage sont confirmés corrigés en production :
- Bug #1 (race condition demande d'accès) : test "double-clic rapide sur Envoyer" et flux admin "créer une fausse demande… la valider" passent, plus aucune erreur `23505` en console.
- Bug #2 (RGPD inatteignable) : test dédié "soumission sans RGPD (mais champs valides) affiche le message dédié" passe, le message d'erreur s'affiche correctement.

**Aucun nouveau bug trouvé** sur ce passage. Aucune vulnérabilité, crash, ou perte de données détectée.

| Zone | Tests | Desktop | Mobile |
|---|---|---|---|
| Catalogue public (anon) | Navigation, filtres, carte teaser confidentielle, clic projet | ✅ | ✅ |
| Demande d'accès | Vide, email invalide, mot de passe faible, RGPD non coché, double-clic, chemin heureux | ✅ | ✅ |
| Formulaire de contact | RGPD non coché (fix bug #2), champs vides, Entrée, email invalide, message long, chemin heureux | ✅ | ✅ |
| Connexion pending (Sophie) | Login, redirection catalogue, pas d'accès `/admin`, mélange d'états d'accès | ✅ | ✅ |
| Connexion validated_visitor (Karim) | Catalogue confidentiel débloqué | ✅ | ✅ |
| Dashboard admin (Léa) | Valider une demande, changer statut d'un contact, vue d'ensemble | ✅ | ✅ |

**Données de test** : 6 comptes (`user_profiles`/`auth.users`), 6 `access_requests`, 6 `contacts` créés pendant ce passage, tous supprimés de la base après coup et vérifiés à 0 restant (`user_profiles_left`/`auth_users_left`/`access_requests_left`/`contacts_left` = 0).

---

## Passage du 15/07/2026 (1er passage — avant correctifs)

**Environnement testé** : preview Vercel `folio-jkprqf3w4-enora-le-turnier-s-projects.vercel.app` (branche `fix/audit-securite-webhooks-probe-rls`, code identique à `main` au moment du test), protégée par Vercel Authentication.
**Outil** : Playwright 1.61.1, exécution automatisée mais scriptée pour reproduire un parcours humain (pauses, scroll, hover avant clic, cas limites volontaires) — config dans [`playwright.config.ts`](playwright.config.ts), tests dans [`e2e/`](e2e/).
**Rôles testés** : anonyme, `pending` (Sophie), `validated_visitor` (Karim), `admin` (Léa) — comptes seed du projet.
**Couverture** : desktop (Chrome) + mobile (émulation Pixel 7).
**Preuves** : vidéo + capture d'écran pour chaque test dans [`test-results/`](test-results/) (un dossier par test × plateforme — le rapport HTML agrégé Playwright n'a pas pu être généré cette session, voir note en fin de document).

### Résumé exécutif

**Passage initial : 39 / 44 exécutions réussies** (22 tests uniques × desktop/mobile). Les 5 échecs pointaient tous vers **le même bug réel**, pas 5 bugs différents — confirmé indépendamment sur desktop et mobile, dans 2 parcours distincts (création de compte, flux admin).

**Les 2 bugs trouvés ont été corrigés le jour même et re-testés (12/12 tests concernés passent après correctif, exécution locale contre le code corrigé) — voir "Correctif appliqué" dans chaque section ci-dessous.**

| Gravité | Nombre | Résumé | Statut |
|---|---|---|---|
| 🟠 Élevée | 1 | Race condition sur la création de compte + demande d'accès (soumission parfois en échec silencieux ou visible) | ✅ Corrigé, confirmé en prod le 15/07 (2e passage) |
| 🟡 Moyenne | 1 | Message d'erreur RGPD inatteignable sur le formulaire de contact | ✅ Corrigé, confirmé en prod le 15/07 (2e passage) |
| — | 0 | Aucune erreur console sur les 39 exécutions réussies du passage initial | — |

Aucune vulnérabilité de sécurité, crash, ou perte de données détectée pendant ce passage. Aucun problème mobile spécifique (les parcours clés se comportent comme sur desktop).

---

## 🟠 Bug #1 (gravité élevée) — Race condition sur la demande d'accès avec création de compte

### Description
Quand un visiteur non connecté crée un compte via "Demander l'accès" (`AccessRequestModal`), deux mécanismes tentent d'insérer la même ligne `access_requests` en parallèle :
1. Le flux normal dans `AccessRequestModal.handleSubmit` (insertion directe après `signUp()`).
2. L'écoute globale `SIGNED_IN` dans `RootLayout.tsx` (`submitPendingAccessRequest`), ajoutée pour gérer le cas où l'email doit être confirmé avant que la session n'arrive.

Ces deux chemins peuvent se déclencher quasi simultanément après un `signUp()` réussi. Le second à s'exécuter percute la contrainte unique `access_requests_one_pending_per_user_project` (erreur Postgres `23505`, HTTP 409).

### Effet observé (2 variantes, selon qui perd la course)
- **Variante silencieuse** (la plus fréquente, 3 occurrences) : la demande est bien créée, l'utilisateur voit "Demande envoyée", mais une erreur apparaît en console :
  `[AccessRequest] échec de la reprise après confirmation email : {code: 23505, ... duplicate key value violates unique constraint "access_requests_one_pending_per_user_project"}`
- **Variante visible** (2 occurrences, dont le flux admin) : l'utilisateur voit l'écran d'erreur du modal ("Impossible d'envoyer la demande") au lieu de la confirmation, alors qu'une ligne a parfois bien été créée côté serveur — incohérence entre ce que voit l'utilisateur et l'état réel en base.

### Étapes de reproduction
1. Aller sur le catalogue, cliquer "Demander l'accès" sur un projet confidentiel, non connecté.
2. Remplir le formulaire avec un email jamais utilisé, mot de passe valide, cocher le RGPD.
3. Cliquer "Envoyer ma demande".
4. Ouvrir la console DevTools → observer l'erreur `23505` (ou, de façon intermittente, l'écran "Impossible d'envoyer la demande" au lieu du succès).

### Cause
`savePendingAccessRequest()` est appelé avant `signUp()`, sans garantie que `clearPendingAccessRequest()` (appelé juste après par le modal) s'exécute avant que le listener `SIGNED_IN` de `RootLayout` ne lise le `localStorage`. Les deux chemins insèrent donc parfois la même ligne en parallèle.

### ✅ Correctif appliqué
Dans `src/data/accessRequests.ts` (`submitPendingAccessRequest`) et `src/components/AccessRequestModal.tsx` (`handleSubmit`), l'erreur Postgres `23505` (unique_violation) sur l'insert `access_requests` n'est plus traitée comme un échec : elle signifie que l'autre chemin a déjà créé la ligne avec succès. Les deux points d'insertion tolèrent maintenant symétriquement cette collision au lieu de la propager. La race elle-même n'est pas éliminée (les deux chemins tentent toujours d'écrire), mais elle devient totalement inoffensive.

**Re-testé** : `access-request.spec.ts` ("chemin heureux", "double-clic") et `admin-dashboard.spec.ts` ("créer une fausse demande… valider") — 5/5 passent en local contre le code corrigé (précédemment en échec), puis reconfirmé sur le 2e passage en production (15/07) sans aucune trace du bug.

---

## 🟡 Bug #2 (gravité moyenne) — Message d'erreur RGPD du formulaire de contact potentiellement inatteignable

### Description
Sur `ContactForm.tsx`, le bouton "Envoyer" est désactivé (`disabled`) tant que la case RGPD n'est pas cochée — **quel que soit l'état des autres champs**. Le message `"Ce consentement est requis pour envoyer votre message."` n'est affiché que si `handleSubmit` s'exécute, ce qui suppose un submit réel du formulaire. Or un bouton `disabled` bloque à la fois le clic **et** la soumission implicite via la touche Entrée dans un champ texte (comportement standard des navigateurs). Concrètement : un visiteur qui n'a pas coché le RGPD n'a **aucun moyen** de déclencher ce message d'erreur — il voit juste un bouton grisé, sans explication du "pourquoi".

### Effet
Mineur en soi (le bouton grisé communique déjà "quelque chose empêche l'envoi"), mais :
- Le message d'erreur dédié (`cf-rgpd-error`) semble être du code mort en pratique.
- Aucune indication claire de la raison précise pour un utilisateur qui n'aurait pas remarqué la case à cocher.

### Étapes de constat
1. Aller sur `/lea-martin#contact`.
2. Remplir Nom/Email/Message, laisser le RGPD non coché.
3. Observer : bouton "Envoyer" grisé, impossible à cliquer.
4. Essayer d'appuyer sur Entrée dans un des champs → rien ne se passe (pas de soumission, donc pas de message d'erreur RGPD visible).

### ✅ Correctif appliqué
Dans `src/components/ContactForm.tsx`, le bouton "Envoyer" n'est plus désactivé par `rgpdMissing` (seulement par `submitting`). La validation post-clic existante (déjà en place pour Nom/Email/Message) s'applique désormais de la même façon au RGPD : `handleSubmit` s'exécute normalement, bloque l'envoi réel tant que la case n'est pas cochée, et affiche le message dédié — comportement cohérent avec les autres champs.

**Re-testé** : `contact-form.spec.ts` — nouveau test "soumission sans RGPD (mais champs valides) affiche le message dédié" + test Entrée (corrigé pour cibler un `<input>` plutôt que le `<textarea>`, qui n'a jamais déclenché de soumission par design HTML) — 12/12 passent en local contre le code corrigé, puis reconfirmé sur le 2e passage en production (15/07).

---

## ✅ Tests réussis (1er passage, 39/44)

| Zone | Tests | Desktop | Mobile |
|---|---|---|---|
| Catalogue public (anon) | Navigation profil→catalogue, filtres type/secteur/outils/mots-clés, carte teaser confidentielle, clic projet public | ✅ | ✅ |
| Demande d'accès | Formulaire vide, email invalide, mot de passe faible, RGPD non coché | ✅ | ✅ |
| Demande d'accès | Double-clic rapide sur Envoyer | ✅ (échouait avant correctif du bug #1) | ✅ |
| Formulaire de contact | Bouton désactivé sans RGPD, champs vides, email invalide, message très long (2600 car.), soumission valide | ✅ | ✅ |
| Connexion pending (Sophie) | Login, redirection catalogue, pas d'accès `/admin`, mélange d'états d'accès sur les cartes | ✅ | ✅ |
| Connexion validated_visitor (Karim) | Login, tout le catalogue confidentiel débloqué | ✅ | ✅ |
| Dashboard admin | Changement de statut d'un message de contact | ✅ | ✅ |
| Dashboard admin | Vue d'ensemble (compteurs, pas d'erreur) | ✅ | ✅ |

**Zéro erreur console JavaScript** sur l'ensemble des 39 exécutions réussies du 1er passage, et sur les 44/44 du 2e passage — aucun crash, aucune ressource en échec, aucune promesse rejetée non gérée.

---

## Note technique

Le rapport HTML agrégé de Playwright n'avait pas été généré correctement lors du 1er passage (`reporter: [["html", ...], ["list"]]` configuré mais échec silencieux) — généré sans problème lors du 2e passage (`npx playwright show-report`), cause du 1er échec non identifiée rétrospectivement (possiblement lié à l'environnement local de l'époque).

Toutes les données créées pendant les deux passages (comptes de test, demandes d'accès, messages de contact) ont été supprimées de la base après coup et vérifiées à 0 ligne restante.
