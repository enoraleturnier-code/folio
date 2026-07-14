import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface AppNotification {
  id: string;
  type: Tables<"notifications">["type"];
  accessRequestId: string | null;
  accessRequestStatus: Tables<"access_requests">["status"] | null;
  projectId: string | null;
  projectTitle: string | null;
  readAt: string | null;
  createdAt: string;
}

type NotificationRow = Pick<
  Tables<"notifications">,
  "id" | "type" | "access_request_id" | "project_id" | "read_at" | "created_at"
> & {
  project: Pick<Tables<"projects">, "title"> | null;
  access_request: Pick<Tables<"access_requests">, "status"> | null;
};

function mapRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    accessRequestId: row.access_request_id,
    accessRequestStatus: row.access_request?.status ?? null,
    projectId: row.project_id,
    projectTitle: row.project?.title ?? null,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

/** RLS (notifications_select_own) restreint deja aux notifications de l'utilisateur connecte. */
export async function getMyNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `id, type, access_request_id, project_id, read_at, created_at,
       project:projects ( title ),
       access_request:access_requests ( status )`,
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return (data ?? []).map(mapRow as (row: unknown) => AppNotification);
}

// Contrairement à approve/rejectAccessRequest, pas de check RETURNING ici : un 0-row
// update (notif déjà lue, id invalide) n'a aucune conséquence métier -- l'appelant ne
// dépend pas d'une confirmation de succès, juste d'un rafraîchissement du badge.
export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) throw error;
}

export async function markAllNotificationsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .in("id", ids)
    .is("read_at", null);

  if (error) throw error;
}
