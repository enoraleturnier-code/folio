import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

type UserRole = Enums<"user_role">;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setRole(null);
      setFullName(null);
      setRoleLoading(false);
      return;
    }
    let cancelled = false;
    setRoleLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setRole(null);
        setFullName(null);
      } else {
        setRole(data.role);
        setFullName(data.full_name);
      }
      setRoleLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, session]);

  return {
    session,
    user: session?.user ?? null as User | null,
    loading,
    role,
    fullName,
    roleLoading,
  };
}
