import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ContactDbStatus = Tables<"contacts">["status"];

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  message: string | null;
  status: ContactDbStatus;
  createdAt: string;
}

/**
 * Insertion publique depuis ContactForm.tsx. `type: "contact"` distingue ces
 * lignes des futures demandes de rdv Cal.com (`type: "rdv"`, hors périmètre) --
 * `status` par défaut ("new") et `id`/`created_at` sont laissés à la base.
 * RLS (contacts_insert_anyone) autorise anon/authenticated ; pas de check
 * RETURNING nécessaire ici (contrairement à un UPDATE) : un INSERT qui
 * viole la policy renvoie une erreur explicite, jamais un succès silencieux.
 */
export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("contacts").insert({
    type: "contact",
    name: input.name,
    email: input.email,
    message: input.message,
    consent_given_at: new Date().toISOString(),
  });

  if (error) throw error;
}

/** Admin-only : tous les messages de contact (hors rdv Cal.com). RLS (contacts_select_admin) restreint déjà aux admins. */
export async function getAllContacts(): Promise<AdminContactMessage[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, email, message, status, created_at")
    .eq("type", "contact")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function updateContactStatus(id: string, status: ContactDbStatus): Promise<void> {
  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`updateContactStatus: no row updated for id=${id}`);
}
