import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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
