import type { ContactMessage } from "./types";

export const contactMessages: ContactMessage[] = [
  {
    id: "c1",
    fullName: "Sarah Nguyen",
    email: "sarah@northlab.io",
    message:
      "Bonjour Léa, nous cherchons un lead designer pour refondre notre console interne. Auriez-vous une disponibilité en septembre pour un premier échange ? Nous sommes basés à Berlin mais totalement remote-friendly.",
    date: "2026-07-01T08:22:00Z",
    status: "nouveau",
  },
  {
    id: "c2",
    fullName: "Julien Perez",
    email: "j.perez@atelier-nord.fr",
    message:
      "Merci pour la mise à jour d'hier — nous validons la V2 en interne, retour d'ici la fin de semaine.",
    date: "2026-06-25T17:45:00Z",
    status: "traite",
  },
  {
    id: "c3",
    fullName: "Elena Costa",
    email: "elena.costa@vestige.co",
    message: "Ancien projet — pour archives uniquement.",
    date: "2026-05-11T11:00:00Z",
    status: "archive",
  },
];
