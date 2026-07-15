# Rapport de QA — Folio+

**Date** : 15/07/2026
**Environnement testé** : preview Vercel `folio-jkprqf3w4-enora-le-turnier-s-projects.vercel.app` (branche `fix/audit-securite-webhooks-probe-rls`, code identique à `main` au moment du test), protégée par Vercel Authentication.
**Outil** : Playwright 1.61.1, exécution automatisée mais scriptée pour reproduire un parcours humain (pauses, scroll, hover avant clic, cas limites volontaires) — config dans [`playwright.config.ts`](playwright.config.ts), tests dans [`e2e/`](e2e/).
**Rôles testés** : anonyme, `pending` (Sophie), `validated_visitor` (Karim), `admin` (Léa) — comptes seed du projet.
**Couverture** : desktop (Chrome) + mobile (émulation Pixel 7).
**Preuves** : vidéo + capture d'écran pour chaque test dans [`test-results/`](test-results/) (un dossier par test × plateforme — le rapport HTML agrégé Playwright n'a pas pu être généré cette session, voir note en fin de document).

## Résumé exécutif

**39 / 44 exécutions réussies** (22 tests uniques × desktop/mobile). Les 5 échecs pointent tous vers **le même bug réel**, pas 5 bugs différents — confirmé indépendamment sur desktop et mobile, dans 2 parcours distincts (création de compte, flux admin).

| Gravité | Nombre | Résumé |
|---|---|---|
| 🟠 Élevée | 1 | Race condition sur la création de compte + demande d'accès (soumission parfois en échec silencieux ou visible) |
| 🟡 Moyenne | 1 | Message d'erreur RGPD potentiellement inatteignable au clavier sur le formulaire de contact |
| — | 0 | Aucune erreur console sur les 39 exécutions réussies |

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

### Preuves
- `test-results/access-request-*chemin-heureux*/video.webm` (desktop et mobile)
- `test-results/admin-dashboard-*puis-la-valider-en-admin*/video.webm`
- `console-errors.txt` associé à chaque dossier

### Cause probable et piste de correctif
`savePendingAccessRequest()` est appelé avant `signUp()`, sans garantie que `clearPendingAccessRequest()` (appelé juste après par le modal) s'exécute avant que le listener `SIGNED_IN` de `RootLayout` ne lise le `localStorage`. Piste : ignorer silencieusement une erreur `23505` dans `submitPendingAccessRequest` (elle signifie "déjà traité par l'autre chemin", pas un vrai échec) plutôt que de la logguer/propager comme une erreur.

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

### Piste de correctif
Soit afficher le message d'aide RGPD dès que l'utilisateur a rempli les autres champs et que la case reste décochée (sans attendre un submit), soit ajouter un texte d'aide toujours visible à côté de la case à cocher expliquant qu'elle est obligatoire.

---

## ✅ Tests réussis (39/44)

| Zone | Tests | Desktop | Mobile |
|---|---|---|---|
| Catalogue public (anon) | Navigation profil→catalogue, filtres type/secteur/outils/mots-clés, carte teaser confidentielle, clic projet public | ✅ | ✅ |
| Demande d'accès | Formulaire vide, email invalide, mot de passe faible, RGPD non coché | ✅ | ✅ |
| Demande d'accès | Double-clic rapide sur Envoyer | ✅ | ✅ (échoue sur desktop, cf. bug #1 — comportement intermittent) |
| Formulaire de contact | Bouton désactivé sans RGPD, champs vides, email invalide, message très long (2600 car.), soumission valide | ✅ | ✅ |
| Connexion pending (Sophie) | Login, redirection catalogue, pas d'accès `/admin`, mélange d'états d'accès sur les cartes | ✅ | ✅ |
| Connexion validated_visitor (Karim) | Login, tout le catalogue confidentiel débloqué | ✅ | ✅ |
| Dashboard admin | Changement de statut d'un message de contact | ✅ | ✅ |
| Dashboard admin | Vue d'ensemble (compteurs, pas d'erreur) | ✅ | ✅ |

**Zéro erreur console JavaScript** sur l'ensemble des 39 exécutions réussies — aucun crash, aucune ressource en échec, aucune promesse rejetée non gérée.

---

## Note technique

Le rapport HTML agrégé de Playwright (avec captures/vidéos intégrées dans une interface consultable) n'a pas été généré correctement cette session malgré la configuration (`reporter: [["html", ...], ["list"]]`) — cause non identifiée, à creuser si besoin (`npx playwright show-report` après un nouveau run). En attendant, chaque test dispose de son propre dossier dans `test-results/` avec vidéo (`video.webm`), capture d'écran (`test-failed-1.png` pour les échecs), trace de debug (`trace.zip`, ouvrable via `npx playwright show-trace <fichier>`) et logs console le cas échéant.

Toutes les données créées pendant ce passage (12 comptes de test, 14 messages de contact) ont été supprimées de la base après coup.
