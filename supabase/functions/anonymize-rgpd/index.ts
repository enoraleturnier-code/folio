import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// F-24 (RGPD, droit a l'effacement) : action self-service, jamais admin --
// la cible est toujours auth.getUser() du JWT appelant, jamais un id fourni
// par le corps de la requete (empeche par construction qu'un utilisateur
// supprime les donnees de quelqu'un d'autre).
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing_auth" }, 401);

  // Client scope au JWT de l'appelant -- sert uniquement a identifier
  // l'utilisateur courant, jamais a effectuer les mutations (RLS ne
  // permettrait pas a un utilisateur non-admin d'ecrire sur ces tables).
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "invalid_session" }, 401);
  const userId = userData.user.id;

  // Toutes les mutations passent par service_role : ni le trio
  // user_profiles/access_requests/contacts ni auth.admin.deleteUser ne
  // sont accessibles en ecriture a un utilisateur non-admin via RLS.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) user_profiles : anonymise sans supprimer la ligne. access_requests.user_id
  // et contacts.user_id portent une contrainte FK reelle vers user_profiles.id
  // (verifie via introspection du schema live, cf. F-24) -- supprimer la ligne
  // casserait ces references. email a une contrainte UNIQUE, d'ou le suffixe
  // userId pour garantir l'unicite de la valeur anonymisee.
  const { data: profileRow, error: profileError } = await admin
    .from("user_profiles")
    .update({
      email: `deleted-${userId}@anonymized.invalid`,
      full_name: "Utilisateur supprimé",
      company: null,
      request_message: null,
      rejection_reason: null,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
  if (profileError) return json({ error: "profile_anonymize_failed", detail: profileError.message }, 500);
  if (!profileRow) return json({ error: "profile_not_found" }, 404);

  // 2) access_requests : le message initial (donnee personnelle) est efface,
  // mais status/rejection_reason/project_id/created_at sont conserves --
  // conforme a la politique de confidentialite ("la raison du refus est
  // conservee ... mais votre message initial peut etre supprime").
  const { error: accessRequestsError } = await admin
    .from("access_requests")
    .update({ message: null })
    .eq("user_id", userId);
  if (accessRequestsError) {
    return json({ error: "access_requests_anonymize_failed", detail: accessRequestsError.message }, 500);
  }

  // 3) contacts : la table porte deja en commentaire de colonne le pattern
  // d'anonymisation attendu ("Anonymise -> Utilisateur supprime sur demande
  // RGPD" / "-> null") -- applique ici a l'identique.
  const { error: contactsError } = await admin
    .from("contacts")
    .update({ name: "Utilisateur supprimé", email: null, message: null })
    .eq("user_id", userId);
  if (contactsError) {
    return json({ error: "contacts_anonymize_failed", detail: contactsError.message }, 500);
  }

  // 4) Suppression du compte auth en dernier : si une etape precedente
  // echoue, l'utilisateur peut encore se reconnecter et reessayer -- aucune
  // contrainte FK reelle entre user_profiles.id et auth.users(id) (verifie
  // via introspection), donc l'ordre ici n'est pas impose techniquement,
  // mais logique métier (on ne coupe l'acces qu'une fois le reste acquis).
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    return json({ error: "auth_delete_failed", detail: deleteUserError.message }, 500);
  }

  return json({ success: true });
});
