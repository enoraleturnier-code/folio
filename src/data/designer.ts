import { supabase } from "@/integrations/supabase/client";
import { deleteDesignerCv } from "@/lib/storage";

import type { Designer } from "./types";

const firstName = "Enora";
const lastName = "Le Turnier";

export const designer: Designer = {
  slug: "enora-le-turnier",
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
  website: "https://example.com",
  calUsername: "enora-le-turnier",
  email: "enoraleturnier@gmail.com",
  location: "Paris — remote friendly",
  cvUrl: "",
  experiencesIntro: "",
};

/**
 * Identité (nom/slug/localisation) reste statique -- aucune colonne DB pour ces
 * champs, hors périmètre de ParametresTab (cf. CLAUDE.md). `email` a rejoint les
 * champs réellement persistés le 09/09 (remplace `twitter`, colonne `twitter_url`
 * supprimée -- plus aucun usage public depuis le retrait du bouton "X" du Hero).
 * Seuls les champs réellement persistés (designer_profiles + admin_settings) sont
 * fusionnés par-dessus le mock. `designer_profiles_select_public` et
 * `get_public_cal_username()` sont lisibles par anon -- utilisable aussi bien par
 * ProfilePage (public) que par ParametresTab (admin).
 */
export async function getDesignerProfile(): Promise<Designer> {
  const { data: profile, error: profileError } = await supabase
    .from("designer_profiles")
    .select(
      "photo_url, profession, adjective, bio, linkedin_url, website_url, email, cv_url, experiences_intro",
    )
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
    website: profile?.website_url ?? "",
    email: profile?.email ?? designer.email,
    calUsername: calUsername ?? "",
    cvUrl: profile?.cv_url ?? "",
    experiencesIntro: profile?.experiences_intro ?? "",
  };
}

export interface DesignerProfileInput {
  photoUrl: string;
  profession: string;
  adjective: string;
  bio: string;
  linkedin: string;
  website: string;
  email: string;
  calUsername: string;
  cvUrl: string;
  experiencesIntro: string;
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

  // Lecture fraîche de cv_url juste avant l'UPDATE (pas la valeur du
  // formulaire potentiellement périmée) -- nécessaire pour savoir si
  // l'ancien fichier doit être nettoyé du Storage après coup.
  const { data: currentRow, error: currentError } = await supabase
    .from("designer_profiles")
    .select("cv_url")
    .eq("user_id", userId)
    .maybeSingle();
  if (currentError) throw currentError;
  const previousCvUrl = currentRow?.cv_url ?? null;

  const { data: profileRow, error: profileError } = await supabase
    .from("designer_profiles")
    .update({
      photo_url: input.photoUrl || null,
      profession: input.profession || null,
      adjective: input.adjective || null,
      bio: input.bio || null,
      linkedin_url: input.linkedin || null,
      website_url: input.website || null,
      email: input.email || null,
      cv_url: input.cvUrl || null,
      experiences_intro: input.experiencesIntro || null,
    })
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profileRow) {
    throw new Error("updateDesignerProfile: aucune ligne designer_profiles mise à jour");
  }

  // Nettoyage best-effort de l'ancien fichier Storage -- un échec ici ne
  // doit pas faire échouer un update déjà acté en base (même logique que
  // le nettoyage Storage de softDeleteProject). Comparaison sur le chemin
  // seul (sans le `?v=<timestamp>` de cache-busting) : `uploadDesignerCv`
  // réutilise désormais un chemin de Storage fixe (`upsert: true`), donc un
  // simple remplacement de CV garde le même chemin -- l'ancien fichier est
  // déjà remplacé en place, un `deleteDesignerCv` sur l'URL précédente
  // supprimerait le fichier qu'on vient d'uploader. Seul un vrai changement
  // de chemin (CV retiré, ou nom du designer modifié) déclenche un nettoyage.
  const stripQuery = (url: string) => url.split("?")[0];
  if (previousCvUrl && stripQuery(previousCvUrl) !== stripQuery(input.cvUrl ?? "")) {
    try {
      await deleteDesignerCv(previousCvUrl);
    } catch (err) {
      console.error("updateDesignerProfile: failed to clean up Storage CV", err);
    }
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
