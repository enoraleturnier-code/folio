import type { Project } from "@/types/project";

export const MAX_LENGTHS = {
  title: 80,
  short_desc: 160,
  long_desc: 3000,
  probleme: 1000,
  decisions: 1000,
  resultat: 1000,
  client_name: 100,
  company_name: 100,
  role: 60,
  team: 100,
} as const;

export type ValidationField =
  keyof typeof MAX_LENGTHS | "thumbnail_url" | "secteur_activite" | "start_date" | "end_date";

export interface ValidationError {
  field: ValidationField;
  message: string;
}

function checkText(
  field: ValidationField,
  value: string | null | undefined,
  max: number,
): ValidationError | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return { field, message: "Ce champ est requis." };
  if (trimmed.length > max) return { field, message: `${trimmed.length}/${max} caractères max.` };
  return null;
}

/** Valide la longueur si rempli, mais n'exige pas que le champ soit rempli. */
function checkOptionalText(
  field: ValidationField,
  value: string | null | undefined,
  max: number,
): ValidationError | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > max) return { field, message: `${trimmed.length}/${max} caractères max.` };
  return null;
}

/**
 * Tous les champs scalaires sont obligatoires à la soumission, y compris
 * ceux masqués en affichage teaser pour un projet confidentiel (client_name,
 * team, start_date, end_date) -- ce masquage est une règle RLS/UI de
 * lecture pour un visiteur non-entitled, pas une règle de saisie admin.
 * Les tags (types/tools/keywords) ne sont volontairement pas comptés comme
 * obligatoires ici, ni `short_desc` ni le trio Problème/Décisions/Résultat
 * (remplissables à la main ou générés par IA, jamais requis pour publier).
 */
export function validateProject(draft: Project): ValidationError[] {
  const errors: ValidationError[] = [];
  const push = (e: ValidationError | null) => e && errors.push(e);

  push(checkText("title", draft.title, MAX_LENGTHS.title));
  push(checkOptionalText("short_desc", draft.short_desc, MAX_LENGTHS.short_desc));
  push(checkText("client_name", draft.client_name, MAX_LENGTHS.client_name));
  push(checkText("company_name", draft.company_name, MAX_LENGTHS.company_name));
  push(checkText("role", draft.role, MAX_LENGTHS.role));
  push(checkText("team", draft.team, MAX_LENGTHS.team));

  push(checkText("long_desc", draft.long_desc, MAX_LENGTHS.long_desc));
  push(checkOptionalText("probleme", draft.ai_structured_desc?.probleme, MAX_LENGTHS.probleme));
  push(checkOptionalText("decisions", draft.ai_structured_desc?.decisions, MAX_LENGTHS.decisions));
  push(checkOptionalText("resultat", draft.ai_structured_desc?.resultat, MAX_LENGTHS.resultat));

  if (!draft.thumbnail_url)
    errors.push({ field: "thumbnail_url", message: "Une image est requise." });
  if (!draft.secteur_activite)
    errors.push({ field: "secteur_activite", message: "Ce champ est requis." });
  if (!draft.start_date) errors.push({ field: "start_date", message: "Ce champ est requis." });
  if (!draft.end_date) errors.push({ field: "end_date", message: "Ce champ est requis." });

  return errors;
}
