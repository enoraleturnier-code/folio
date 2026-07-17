import { Alert } from "@/components/Alert";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const CONTENT_GUIDE = `## 👋 Bienvenue

Folio+ te permet de découvrir le travail d'un designer freelance : ses projets publics sont visibles librement, et tu peux demander l'accès à ses projets confidentiels pour voir le détail complet.

## 👥 Pour qui ?

- **Admin (le designer)** : crée ses projets, valide ou refuse les demandes d'accès, gère les contacts reçus.
- **Visiteur non connecté** : parcourt les projets publics, voit les cartes teaser des projets confidentiels, peut demander l'accès ou contacter le designer.
- **Visiteur validé** : accède aux projets confidentiels pour lesquels une demande a été approuvée (l'accès est accordé projet par projet, pas globalement), peut contacter le designer.

## 🚀 Démarrer en 3 étapes

1. Clique sur « Demander l'accès » depuis un projet confidentiel, cela crée ton compte en une seule étape (nom, email, mot de passe, message, consentement RGPD).
2. Ton compte est actif immédiatement, en attente de validation par le designer.
3. Tu reçois un email dès que ta demande est traitée, connecte-toi pour accéder aux projets validés.

## 📋 Guide par fonctionnalité

**Demander l'accès à un projet confidentiel.** Clique sur le bouton « Demander l'accès » depuis la carte teaser du projet, remplis le formulaire, envoie. Le statut affiché sur la carte évolue automatiquement (en cours / validé / refusé).

**Prendre un rendez-vous.** Sur la page profil du designer, le widget Cal.com (si disponible) te permet de réserver un créneau directement, sans quitter la page.

**Contacter le designer.** Formulaire simple (nom, email, message) accessible depuis la page profil, sans connexion requise.

## ❓ Questions fréquentes

- **Pourquoi je ne vois pas un projet en entier ?** Il est confidentiel, demande l'accès depuis sa carte teaser.
- **Combien de temps pour être validé ?** Ça dépend du designer, tu reçois un email automatique dès sa décision.
- **Je peux redemander après un refus ?** Non, seul le contact direct avec le designer reste possible sur ce projet.

## 🔒 Les données personnelles (RGPD)

- **Responsable du traitement** : Enora Le Turnier (persona affiché : Léa Martin).
- **Données collectées** : nom, email, mot de passe (haché via Supabase Auth), message de demande d'accès, entreprise (optionnel), message de contact.
- **Finalité** : gérer son compte, traiter ses demandes d'accès et ses messages.
- **Base légale** : ton consentement, donné explicitement à l'inscription et sur le formulaire de contact.
- **Durée de conservation** : tant que le compte est actif.
- **Qui y a accès** : l'admin uniquement.
- **Les droits** : accès, rectification, suppression, opposition, portabilité.
- **Supprimer ton compte et tes données** : bouton « Supprimer mes données » dans les [paramètres du compte](/account), anonymisation immédiate, sans confirmation supplémentaire.
- **Contact** : enoraleturnier@gmail.com`;

const CONTENT_VERSION = `## 🔢 Version

v1.0 (MVP), mise à jour le 17/07/2026`;

export function HelpPage() {
  useDocumentTitle("Aide");
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">Aide</p>
        <h1 className="mb-10 text-4xl font-medium text-on-surface md:text-5xl">
          Besoin d'aide ? Voici un guide utilisateur !
        </h1>
        <MarkdownContent content={CONTENT_GUIDE} className="space-y-6" />
        <div className="mt-6">
          <Alert
            type="info"
            title="Protection contre les abus"
            description="Le formulaire de contact est protégé contre le spam (3 soumissions par email par tranche de 10 minutes) ; ta demande d'accès passe toujours par une vérification humaine, jamais automatique."
          />
        </div>
        <MarkdownContent content={CONTENT_VERSION} className="mt-6 space-y-6" />
      </main>
      <Footer />
    </div>
  );
}
