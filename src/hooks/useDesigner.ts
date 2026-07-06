import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Designer } from "@/data/types";

export const DEFAULT_DESIGNER_SLUG = "lea-martin";

type DesignerRow = {
  slug: string;
  full_name?: string | null;
  fullName?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatar?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  website?: string | null;
  cal_username?: string | null;
  calUsername?: string | null;
  email?: string | null;
  location?: string | null;
};

function mapRow(row: DesignerRow): Designer {
  return {
    slug: row.slug,
    fullName: row.full_name ?? row.fullName ?? "",
    headline: row.headline ?? "",
    bio: row.bio ?? "",
    avatar: row.avatar ?? "",
    linkedin: row.linkedin ?? "",
    twitter: row.twitter ?? "",
    website: row.website ?? "",
    calUsername: row.cal_username ?? row.calUsername ?? "",
    email: row.email ?? "",
    location: row.location ?? "",
  };
}

async function fetchDesigner(slug: string): Promise<Designer | null> {
  const { data, error } = await supabase
    .from("designer_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapRow(data as DesignerRow);
}

export const designerQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["designer", slug],
    queryFn: () => fetchDesigner(slug),
    staleTime: 60_000,
  });

export function useDesigner(slug: string = DEFAULT_DESIGNER_SLUG) {
  const query = useQuery(designerQueryOptions(slug));

  useEffect(() => {
    if (query.error) {
      toast.error("Impossible de charger le profil designer.", {
        description:
          query.error instanceof Error ? query.error.message : "Erreur inconnue.",
      });
    }
  }, [query.error]);

  return query;
}
