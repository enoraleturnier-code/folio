# 📦 Folio+

Portfolio privé à accès conditionnel pour designer freelance : projets publics visibles par tous, projets confidentiels réservés aux visiteurs validés manuellement, sans partage de PDF ni risque légal.

## 🔗 Accès

- App en ligne : [https://folio-sandy-eight.vercel.app/lea-martin](https://folio-sandy-eight.vercel.app/lea-martin)
- Comptes de test (3 personas) : Léa Martin (admin, accès dashboard), Sophie Michelle (pending, demande en attente), Karim Mansouri (validated_visitor, accès projets confidentiels) — identifiants en note privée, non partagés ici

## 🛠️ Stack

React 19, Vite, React Router, Tailwind v4 (front) · Supabase : PostgreSQL, Auth, RLS, Storage, Edge Functions, pg_cron (base de données) · Resend (emails transactionnels) · API Mistral (feature IA) · API Notion (veille design) · [Cal.com](http://Cal.com) : embed React (prise de RDV) · Vercel (déploiement) · Claude Code (développement) · Claude Cowork (automatisation veille design) · GitHub (versioning)

## ✨ Fonctionnalités principales

- Pages profil & contact du designer
- Catalogue de projets avec filtres par type, secteur, outils et mots-clés
- Fiches projet publiques et confidentielles (carte teaser si accès restreint)
- Système de demande d'accès par projet, validation manuelle par l'admin avec raison obligatoire si refus
- Prise de RDV intégrée via widget [Cal.com](http://Cal.com), sans quitter le portfolio (work in progress)
- Dashboard admin : gestion des projets en ligne, demandes d'accès, contacts & messages, Veille de design hebdo, paramètres
- Feature IA : bouton « Structurer avec l'IA » → Edge Function `generate-ai-description` → API Mistral → draft Problème/Décisions/Résultat, éditable avant publication
- Automatisation : Veille Design Hebdo, Claude Cowork alimente une base Notion, synchronisée vers Supabase via pg_cron, affichée et filtrable dans le dashboard admin

## 🚀 Installation en local

```bash
git clone [url-du-repo]
cd folio-plus
npm install
npm run dev
```

## 📁 Structure du repo

```
folio-plus/
├── src/                 # application (React + Vite + React Router)
├── public/
├── supabase/            # migrations SQL, Edge Functions
├── docs/                # maquettes Stitch, rapports (QA, sécurité, WCAG), doc technique/utilisateur, RGPD
├── scripts/             # scripts admin ponctuels (lisent .env.admin)
├── DESIGN.md            # reference pour le design system à jour
├── CLAUDE.md            # notes de contexte pour Claude Code
└── README.md
```

## 🔑 Variables d'environnement

```bash
VITE_SUPABASE_URL=[l'URL Supabase]
VITE_SUPABASE_PUBLISHABLE_KEY=[la clé publishable Supabase]
MISTRAL_API_KEY=[la clé, côté serveur / Edge Function uniquement]
NOTION_API_KEY=[la clé d'intégration Notion, côté serveur / Edge Function uniquement]
RESEND_API_KEY=[la clé Resend, côté serveur uniquement]
CRON_SYNC_SECRET=[secret générique pour l'appel pg_cron → Edge Function]
```

Aucune clé secrète dans le code ni commit, `.env` est dans `.gitignore`. Détail complet des variables (dont `SUPABASE_SERVICE_ROLE_KEY`) dans la [doc technique](docs/technical-documentation.md).

## ☁️ Déploiement

Hébergé sur Vercel (projet `folio`), connecté au repo GitHub. Chaque push sur `main` déclenche un déploiement automatique en production, chaque branche/PR génère une preview.

## 📚 Documentation

- [Documentation technique / handover](docs/technical-documentation.md) — architecture, modèle de données, variables d'environnement, intégrations, points de vigilance
- [Rapport d'audit de sécurité](docs/RAPPORT_SECURITE.md) ([PDF](docs/RAPPORT_SECURITE.pdf))
- [Rapport de QA](docs/RAPPORT_QA.md)
- [Audit accessibilité WCAG AA (dark)](docs/AUDIT_ACCESSIBILITE_DARK.pdf)

Le guide utilisateur (parcours, FAQ, RGPD) est directement intégré à l'application, accessible via le bouton « Aide » du footer (`/aide`).

## 👤 Auteur

Enora Le Turnier (persona de démo : Léa Martin), projet fil rouge Bootcamp Vibe Coding, Lion.
