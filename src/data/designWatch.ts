import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DesignWatchEntry = Tables<"design_watch_entries">;

/**
 * Admin-only : toutes les entrées de veille, triées par période couverte (la plus récente
 * d'abord) -- pas par synced_at, qui reste réservé au calcul du badge de notification.
 * RLS (design_watch_entries_select_admin) restreint déjà aux admins.
 */
export async function getDesignWatchEntries(): Promise<DesignWatchEntry[]> {
  const { data, error } = await supabase
    .from("design_watch_entries")
    .select("*")
    .order("periode_fin", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data ?? [];
}

export interface TriggerSyncResult {
  synced: number;
  timestamp: string;
}

/** Déclenche une synchro manuelle ("Forcer une synchro maintenant"). Réservé admin, vérifié côté Edge Function. */
export async function triggerNotionSync(accessToken: string): Promise<TriggerSyncResult> {
  const { data, error } = await supabase.functions.invoke<TriggerSyncResult>("sync-notion-veille", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;
  if (!data) throw new Error("triggerNotionSync: réponse vide.");
  return data;
}
