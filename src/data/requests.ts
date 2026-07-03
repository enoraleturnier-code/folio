import type { AccessRequest } from "./types";

export const accessRequests: AccessRequest[] = [
  {
    id: "r1",
    fullName: "Marc Dubois",
    company: "Kairos Ventures",
    email: "marc.dubois@kairos.vc",
    projectTitles: ["Helio Medical", "Orbit Logistics"],
    message:
      "Bonjour Léa, nous étudions un investissement dans une clinique privée et souhaiterions comprendre votre travail sur Helio.",
    date: "2026-06-28T10:12:00Z",
    status: "pending",
  },
  {
    id: "r2",
    fullName: "Amélie Rousseau",
    company: "Studio Poème",
    email: "amelie@studiopoeme.fr",
    projectTitles: ["Orbit Logistics"],
    message: "Curieuse de voir vos systèmes temps-réel — nous refondons une console similaire.",
    date: "2026-06-20T14:03:00Z",
    status: "approved",
  },
  {
    id: "r3",
    fullName: "Thomas Bergier",
    company: "Freelance",
    email: "tom@bergier.io",
    projectTitles: ["Helio Medical"],
    message: "Peux-tu partager plus de détails ?",
    date: "2026-06-14T09:31:00Z",
    status: "rejected",
    rejectionReason: "Demande hors périmètre — pas de contexte professionnel identifié.",
  },
];
