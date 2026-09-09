import type { ExperienceInput } from "@/data/experiences";

export const MAX_LENGTHS = {
  title: 80,
  company: 80,
  short_desc: 200,
  bullet: 200,
  impact: 400,
} as const;

export type ValidationField = keyof typeof MAX_LENGTHS | "start_date" | "end_date";

export interface ValidationError {
  field: ValidationField;
  message: string;
}

/** Libellé humain de chaque champ, pour le message "Le champ [nom] est obligatoire." */
export const FIELD_LABELS: Record<ValidationField, string> = {
  title: "Titre du poste",
  company: "Entreprise",
  short_desc: "Description",
  bullet: "Point clé",
  impact: "Impact",
  start_date: "Date de début",
  end_date: "Date de fin",
};

function requiredError(field: ValidationField): ValidationError {
  return { field, message: `Le champ ${FIELD_LABELS[field]} est obligatoire.` };
}

function checkText(
  field: ValidationField,
  value: string | null | undefined,
  max: number,
): ValidationError | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return requiredError(field);
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
 * `title`/`company`/`short_desc`/`start_date` obligatoires. `short_desc`
 * fusionne l'ancien couple short_desc/context : affiché dans l'en-tête de
 * l'accordéon (tronqué visuellement via CSS `truncate` si trop long, pas de
 * contrainte stricte d'une ligne côté validation). `end_date` optionnelle
 * (poste actuel = null) mais doit être postérieure à `start_date` si
 * renseignée. `impact` optionnel avec longueur max. Chaque ligne de
 * `bullets` (saisie en textarea multi-lignes, une ligne = un élément)
 * validée individuellement contre `MAX_LENGTHS.bullet` -- les lignes vides
 * sont ignorées (pas d'erreur "obligatoire" sur les puces, une expérience
 * peut n'en avoir aucune). `projectId` n'a pas besoin de validation de
 * contenu : c'est un sélecteur parmi les projets existants (ou vide),
 * jamais une saisie libre.
 */
export function validateExperience(draft: ExperienceInput): ValidationError[] {
  const errors: ValidationError[] = [];
  const push = (e: ValidationError | null) => e && errors.push(e);

  push(checkText("title", draft.title, MAX_LENGTHS.title));
  push(checkText("company", draft.company, MAX_LENGTHS.company));
  push(checkText("short_desc", draft.shortDesc, MAX_LENGTHS.short_desc));
  push(checkOptionalText("impact", draft.impact, MAX_LENGTHS.impact));

  if (!draft.startDate) {
    errors.push(requiredError("start_date"));
  } else if (draft.endDate && draft.endDate < draft.startDate) {
    errors.push({ field: "end_date", message: "La date de fin doit être postérieure au début." });
  }

  for (const bullet of draft.bullets) {
    const err = checkOptionalText("bullet", bullet, MAX_LENGTHS.bullet);
    if (err) {
      errors.push(err);
      break;
    }
  }

  return errors;
}
