import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/MarkdownContent";

const CONTENT = `## 1. Qui traite vos données ?

Ce site est édité par Enora Le Turnier, dans le cadre d'un projet personnel réalisé en formation (bootcamp), à titre non commercial.

Contact pour toute question relative à vos données personnelles : enoraleturnier@gmail.com

## 2. Quelles données sont collectées, et pourquoi

| Donnée collectée | Quand | Pourquoi |
|---|---|---|
| Nom, entreprise, email, mot de passe | Création de compte (demande d'accès) | Vous identifier, gérer votre demande d'accès à un projet confidentiel |
| Message de demande | Formulaire de demande d'accès | Contextualiser votre demande |
| Nom, email, message | Formulaire de contact | Répondre à votre message |
| Consentement horodaté | Toute soumission de formulaire | Preuve légale de votre accord (RGPD) |

Aucune donnée n'est collectée à votre insu. Aucun cookie de suivi publicitaire ou d'analyse comportementale n'est utilisé — seul un cookie technique de session (authentification) est déposé, strictement nécessaire au fonctionnement du site.

## 3. Base légale du traitement

Le traitement repose sur votre **consentement explicite**, recueilli à chaque formulaire via une case à cocher dédiée, non pré-cochée. Vous pouvez retirer ce consentement à tout moment (voir section 6).

## 4. Qui a accès à vos données

Vos données ne sont jamais vendues ni partagées à des fins commerciales. Elles sont traitées par :

| Destinataire | Rôle | Localisation |
|---|---|---|
| Supabase | Hébergement base de données, authentification | Union Européenne (région eu-central-1, Francfort, Allemagne) |
| Resend | Envoi des emails transactionnels | États-Unis |
| Mistral AI | Génération de suggestions de contenu (aide à la rédaction du catalogue, jamais vos données personnelles de contact) | Union Européenne |

Si un ou plusieurs de ces prestataires sont situés hors de l'Union Européenne, le transfert est encadré par des clauses contractuelles types (Standard Contractual Clauses) ou un mécanisme équivalent garanti par le prestataire.

## 5. Durée de conservation

Vos données sont conservées tant que votre compte est actif. En cas de refus d'accès à un projet, la raison du refus est conservée (elle ne contient aucune donnée personnelle) mais votre message initial peut être supprimé sur demande.

## 6. Vos droits

Conformément au RGPD, vous disposez des droits suivants :

- **Droit d'accès** : connaître les données que nous détenons sur vous
- **Droit de rectification** : corriger une donnée inexacte
- **Droit à l'effacement** : supprimer définitivement votre compte et vos données via le bouton **"Supprimer mes données"** disponible dans votre espace compte — une confirmation vous sera demandée avant toute suppression, qui est ensuite immédiate et irréversible
- **Droit à la portabilité** : recevoir vos données dans un format structuré
- **Droit d'opposition** : vous opposer à un traitement

Pour exercer les droits d'accès, de rectification, de portabilité ou d'opposition, ou en cas de difficulté avec la suppression en libre-service, contactez enoraleturnier@gmail.com.

## 7. Sécurité

L'accès à vos données est protégé par des règles de sécurité au niveau de la base de données (Row Level Security) : chaque utilisateur ne peut voir que ce qui le concerne, et les projets confidentiels ne sont visibles qu'après validation manuelle par le designer. Les mots de passe sont chiffrés et ne sont jamais stockés en clair.

## 8. Modifications de cette politique

Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut de cette page.`;

export function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-16">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          Confidentialité
        </p>
        <h1 className="mb-2 text-4xl font-medium text-on-surface md:text-5xl">
          Politique de confidentialité
        </h1>
        <p className="mb-10 text-sm text-on-surface-variant">
          Dernière mise à jour : 12 juillet 2026
        </p>
        <MarkdownContent content={CONTENT} className="space-y-6" />
      </main>
      <Footer />
    </div>
  );
}
