import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const PENDING_ACCESS_REQUEST_KEY = "folioplus_pending_access_request";

export interface PendingAccessRequest {
  company: string;
  message: string | null;
  projectIds: string[];
  requestSessionId: string;
  consentGivenAt: string;
}

/**
 * Signup + demande d'accès sont un seul geste côté visiteur, mais si le projet
 * exige la confirmation d'email, `supabase.auth.signUp()` ne renvoie aucune
 * session tant qu'il n'a pas cliqué le lien reçu — la sélection de projets et
 * le message seraient perdus entre-temps sans ce relai. Repris par
 * `submitPendingAccessRequest` dès l'événement SIGNED_IN (cf. RootLayout).
 */
export function savePendingAccessRequest(payload: PendingAccessRequest): void {
  localStorage.setItem(PENDING_ACCESS_REQUEST_KEY, JSON.stringify(payload));
}

export function clearPendingAccessRequest(): void {
  localStorage.removeItem(PENDING_ACCESS_REQUEST_KEY);
}

/** Lit puis supprime immédiatement l'entrée en attente (évite une double soumission si plusieurs listeners SIGNED_IN se déclenchent). */
export function takePendingAccessRequest(): PendingAccessRequest | null {
  const raw = localStorage.getItem(PENDING_ACCESS_REQUEST_KEY);
  if (!raw) return null;
  localStorage.removeItem(PENDING_ACCESS_REQUEST_KEY);
  try {
    return JSON.parse(raw) as PendingAccessRequest;
  } catch {
    return null;
  }
}

export async function submitPendingAccessRequest(
  userId: string,
  pending: PendingAccessRequest,
): Promise<void> {
  const { data: profileRow, error: profileError } = await supabase
    .from("user_profiles")
    .update({ company: pending.company, request_message: pending.message })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profileRow) {
    throw new Error(
      `submitPendingAccessRequest: no user_profiles row updated for id=${userId} (not found, or not permitted)`,
    );
  }

  const rows = pending.projectIds.map((projectId) => ({
    user_id: userId,
    project_id: projectId,
    request_session_id: pending.requestSessionId,
    consent_given_at: pending.consentGivenAt,
    message: pending.message,
  }));
  const { error: insertError } = await supabase.from("access_requests").insert(rows);
  if (insertError) throw insertError;
}

export type MyAccessRequest = Pick<
  Tables<"access_requests">,
  "id" | "project_id" | "status" | "rejection_reason"
>;

/**
 * Own access requests for the current session, one row per (project, visitor).
 * RLS (access_requests_select) already restricts rows to `user_id = auth.uid()`
 * — no client-side filtering needed. Requires an authenticated session;
 * returns an empty list for anon visitors (nothing to read).
 */
export async function getMyAccessRequests(): Promise<MyAccessRequest[]> {
  const { data, error } = await supabase
    .from("access_requests")
    .select("id, project_id, status, rejection_reason");

  if (error) throw error;
  return data ?? [];
}

export interface AdminAccessRequest {
  id: string;
  status: Tables<"access_requests">["status"];
  message: string | null;
  rejectionReason: string | null;
  createdAt: string;
  validatedAt: string | null;
  rejectedAt: string | null;
  project: { id: string; title: string } | null;
  visitor: { fullName: string | null; email: string; company: string | null } | null;
}

type AdminAccessRequestRow = Pick<
  Tables<"access_requests">,
  "id" | "status" | "message" | "rejection_reason" | "created_at" | "validated_at" | "rejected_at"
> & {
  project: Pick<Tables<"projects">, "id" | "title"> | null;
  visitor: Pick<Tables<"user_profiles">, "full_name" | "email" | "company"> | null;
};

function mapAdminRow(row: AdminAccessRequestRow): AdminAccessRequest {
  return {
    id: row.id,
    status: row.status,
    message: row.message,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    validatedAt: row.validated_at,
    rejectedAt: row.rejected_at,
    project: row.project,
    visitor: row.visitor
      ? { fullName: row.visitor.full_name, email: row.visitor.email, company: row.visitor.company }
      : null,
  };
}

/** Admin-only : toutes les demandes, jointes visiteur + projet. RLS (access_requests_select) restreint déjà aux admins. */
export async function getAllAccessRequests(): Promise<AdminAccessRequest[]> {
  const { data, error } = await supabase
    .from("access_requests")
    .select(
      `id, status, message, rejection_reason, created_at, validated_at, rejected_at,
       project:projects ( id, title ),
       visitor:user_profiles ( full_name, email, company )`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAdminRow as (row: unknown) => AdminAccessRequest);
}

export async function approveAccessRequest(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("access_requests")
    .update({ status: "approved", validated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`approveAccessRequest: no row updated for id=${id}`);
}

export async function rejectAccessRequest(id: string, reason: string): Promise<void> {
  const { data, error } = await supabase
    .from("access_requests")
    .update({ status: "rejected", rejected_at: new Date().toISOString(), rejection_reason: reason })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`rejectAccessRequest: no row updated for id=${id}`);
}
