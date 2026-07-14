import { supabase } from "@/integrations/supabase/client";

import type { Designer } from "./types";

const firstName = "Léa";
const lastName = "Martin";

export const designer: Designer = {
  slug: "lea-martin",
  firstName,
  lastName,
  fullName: `${firstName} ${lastName}`,
  profession: "Designeuse produit",
  adjective: "Visionnaire",
  headline: "Designeuse produit — interfaces sobres, décisions nettes.",
  bio: "Je dessine des interfaces sobres pour des équipes qui prennent des décisions rapides. Dix ans à ciseler des produits SaaS, à cadrer des systèmes de design, et à défendre l'utilisateur là où ça compte : dans la salle où l'on tranche.",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ6gHuqRXyMQser0KzvPIMw2L6EtYW15caFUVyuRkSeKTfo_NrEAM-VRq-KMzq6agx4LKN3LZ9IZ7NUraU-wbpcv94etLyE7jXcvor4s-clkIo2aQV9VhwJwjIyNjOdzrrjxPSQbDel4qKEA0M88G0OZtKYxIiY9M7VgmyzxYJBPOI6JwJtWeQ8R_MYJqi-jFe6Jg2Sr-ZviF-Bkqj2q1IxyhH-ZudRLvzHwnZmKFJ-TVvUBOL3D7hi8DbOoY7BKgVOV26c89gtdk",
  linkedin: "https://example.com/in/demo-linkedin",
  twitter: "https://example.com/demo-x",
  website: "https://example.com",
  calUsername: "lea-martin",
  email: "hello@leamartin.design",
  location: "Paris — remote friendly",
};

/**
 * Identité (nom/slug/email/localisation) reste statique -- aucune colonne DB pour ces
 * champs, hors périmètre de ParametresTab (cf. CLAUDE.md). Seuls les champs réellement
 * persistés (designer_profiles + admin_settings) sont fusionnés par-dessus le mock.
 * `designer_profiles_select_public` et `get_public_cal_username()` sont lisibles par
 * anon -- utilisable aussi bien par ProfilePage (public) que par ParametresTab (admin).
 */
export async function getDesignerProfile(): Promise<Designer> {
  const { data: profile, error: profileError } = await supabase
    .from("designer_profiles")
    .select("photo_url, profession, adjective, bio, linkedin_url, twitter_url, website_url")
    .eq("slug", designer.slug)
    .maybeSingle();
  if (profileError) throw profileError;

  const { data: calUsername, error: calError } = await supabase.rpc("get_public_cal_username");
  if (calError) throw calError;

  return {
    ...designer,
    avatar: profile?.photo_url ?? designer.avatar,
    profession: profile?.profession ?? designer.profession,
    adjective: profile?.adjective ?? designer.adjective,
    bio: profile?.bio ?? designer.bio,
    linkedin: profile?.linkedin_url ?? "",
    twitter: profile?.twitter_url ?? "",
    website: profile?.website_url ?? "",
    calUsername: calUsername ?? "",
  };
}

export interface DesignerProfileInput {
  photoUrl: string;
  profession: string;
  adjective: string;
  bio: string;
  linkedin: string;
  twitter: string;
  website: string;
  calUsername: string;
}

/**
 * Update réel sur les deux tables -- RLS (designer_profiles_update_admin /
 * admin_settings_update_admin) restreint déjà aux admins. admin_settings n'a encore
 * aucune ligne pour cet admin tant que cal_username n'a jamais été enregistré, d'où
 * l'upsert (vs update simple pour designer_profiles, dont la ligne existe déjà).
 * RETURNING + check sur les deux : ne jamais supposer qu'une absence d'erreur veut
 * dire qu'une ligne a bien été affectée (cf. CLAUDE.md, RLS peut filtrer 0 ligne).
 */
export async function updateDesignerProfile(input: DesignerProfileInput): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("updateDesignerProfile: utilisateur non authentifié");

  const { data: profileRow, error: profileError } = await supabase
    .from("designer_profiles")
    .update({
      photo_url: input.photoUrl || null,
      profession: input.profession || null,
      adjective: input.adjective || null,
      bio: input.bio || null,
      linkedin_url: input.linkedin || null,
      twitter_url: input.twitter || null,
      website_url: input.website || null,
    })
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profileRow) {
    throw new Error("updateDesignerProfile: aucune ligne designer_profiles mise à jour");
  }

  const { data: settingsRow, error: settingsError } = await supabase
    .from("admin_settings")
    .upsert({ user_id: userId, cal_username: input.calUsername || null }, { onConflict: "user_id" })
    .select("id")
    .maybeSingle();
  if (settingsError) throw settingsError;
  if (!settingsRow) {
    throw new Error("updateDesignerProfile: échec de l'enregistrement des paramètres RDV");
  }
}
