import { supabase } from "@/integrations/supabase/client";

export type RefTable = "tools_ref" | "keywords_ref" | "project_types_ref";

export interface RefRow {
  id: string;
  name: string;
}

async function getRef(table: RefTable): Promise<RefRow[]> {
  const { data, error } = await supabase.from(table).select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

export const getToolsRef = () => getRef("tools_ref");
export const getKeywordsRef = () => getRef("keywords_ref");
export const getTypesRef = () => getRef("project_types_ref");

/**
 * Insert-if-missing pour une valeur de tag tapee librement par l'admin.
 * Normalise (trim + comparaison insensible a la casse) contre les valeurs
 * deja chargees pour eviter les doublons style "Figma" / "figma" / "Figma "
 * qui pollueraient les filtres du catalogue -- reutilise l'entree existante
 * au lieu d'en creer une nouvelle si une equivalente existe deja.
 */
export async function ensureRefValue(
  table: RefTable,
  name: string,
  existing: RefRow[],
): Promise<RefRow> {
  const trimmed = name.trim();
  const match = existing.find((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match;

  const { data, error } = await supabase
    .from(table)
    .insert({ name: trimmed })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}
