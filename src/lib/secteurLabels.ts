import type { SecteurActivite } from "@/types/project";

/** secteur_activite est un enum technique en base — jamais affiché brut à l'utilisateur. */
export const SECTEUR_LABELS: Record<SecteurActivite, string> = {
  tech_saas: "Tech & SaaS",
  ecommerce: "E-commerce",
  finance_banque_assurance: "Finance & Assurance",
  sante: "Santé",
  education: "Éducation",
  media_culture: "Média & Culture",
  industrie_manufacturing: "Industrie",
  retail_distribution: "Retail & Distribution",
  immobilier: "Immobilier",
  rh_recrutement: "RH & Recrutement",
  transport_logistique: "Transport & Logistique",
  tourisme_hotellerie: "Tourisme & Hôtellerie",
  alimentation_restauration: "Alimentation & Restauration",
  energie_environnement: "Énergie & Environnement",
  sport_bien_etre: "Sport & Bien-être",
  luxe_mode: "Luxe & Mode",
  juridique_conseil: "Juridique & Conseil",
  association_ngo: "Association / ONG",
  entreprise_publique: "Entreprise publique",
  startup: "Startup",
  autre: "Autre",
};

export function formatSecteur(value: SecteurActivite | string | null | undefined): string {
  if (!value) return "";
  return SECTEUR_LABELS[value as SecteurActivite] ?? value;
}
