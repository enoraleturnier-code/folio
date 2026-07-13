import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/MarkdownContent";

const CONTENT = `## Éditeur du site

**Nom** : Enora Le Turnier
**Statut** : Particulier — ce site est un projet personnel réalisé dans le cadre d'une formation (bootcamp), à titre non commercial. Aucune immatriculation (SIRET) n'est requise pour ce type de site, en l'absence d'activité commerciale.
**Email** : enoraleturnier@gmail.com

## Note sur les données de démonstration

Ce site est un MVP (Minimum Viable Product) développé dans le cadre d'une formation. Le profil "Léa Martin" ainsi que les projets, clients et informations associées affichés dans le catalogue sont des données de démonstration fictives, créées à des fins de test et de présentation. Elles ne correspondent à aucune personne physique ou morale réelle.

## Hébergement

**Base de données et authentification** : Supabase Inc.
Données hébergées en Union Européenne (région eu-central-1, Francfort, Allemagne).
[Adresse du siège social de Supabase Inc. — à vérifier]

**Déploiement du site** : Vercel Inc.
340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis

## Propriété intellectuelle

L'ensemble des contenus présents sur ce site (textes, visuels, identité graphique, code source) est la propriété d'Enora Le Turnier, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable écrite.

Les projets affichés dans le catalogue de démonstration sont fictifs (voir section ci-dessus) et ne font l'objet d'aucun accord de confidentialité réel.

## Données personnelles

Le traitement des données personnelles réellement collectées sur ce site (via les formulaires de contact et de demande d'accès) est décrit dans la [Politique de confidentialité](/politique-de-confidentialite).

## Cookies

Ce site utilise uniquement un cookie technique de session, strictement nécessaire à l'authentification. Aucun cookie de suivi publicitaire ou d'analyse comportementale n'est utilisé.

## Contact

Pour toute question relative à ce site, contactez enoraleturnier@gmail.com.`;

export function LegalNoticePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">Légal</p>
        <h1 className="mb-2 text-4xl font-medium text-on-surface md:text-5xl">Mentions légales</h1>
        <p className="mb-10 text-sm text-on-surface-variant">
          Dernière mise à jour : 12 juillet 2026
        </p>
        <MarkdownContent content={CONTENT} className="space-y-6" />
      </main>
      <Footer />
    </div>
  );
}
