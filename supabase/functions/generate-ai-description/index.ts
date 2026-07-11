import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

const STRUCTURE_TOOL = {
  name: "structure_project",
  description:
    "Structure des notes libres de projet design en probleme/decisions/resultat, avec suggestions de tags.",
  input_schema: {
    type: "object",
    properties: {
      probleme: { type: "string", description: "Le defi initial, en francais, concis." },
      decisions: { type: "string", description: "Les choix strategiques faits, en francais, concis." },
      resultat: { type: "string", description: "L'impact final et les retours, en francais, concis." },
      tools_suggestions: { type: "array", items: { type: "string" }, description: "Outils probables (ex: Figma, Notion)." },
      keywords_suggestions: { type: "array", items: { type: "string" }, description: "Mots-cles courts pertinents." },
      types_suggestions: { type: "array", items: { type: "string" }, description: "Types de design concernes (ex: UX-UI, Branding)." },
    },
    required: ["probleme", "decisions", "resultat"],
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing_auth" }, 401);

  // Le JWT verifie par la gateway Supabase (verify_jwt: true) garantit un
  // utilisateur authentifie, mais pas un admin -- verification explicite du
  // role ici, sinon un pending/validated_visitor authentifie pourrait aussi
  // appeler cette fonction.
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: role, error: roleError } = await callerClient.rpc("get_my_role");
  if (roleError || role !== "admin") return json({ error: "forbidden" }, 403);

  let notes: string | undefined;
  try {
    const body = await req.json();
    notes = body?.notes;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  if (!notes || typeof notes !== "string" || !notes.trim()) {
    return json({ error: "missing_notes" }, 400);
  }

  if (!ANTHROPIC_API_KEY) return json({ error: "anthropic_not_configured" }, 500);

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system:
        "Tu structures les notes libres d'un designer freelance sur un projet, pour son portfolio. Reponds en francais, ton professionnel et concis.",
      tools: [STRUCTURE_TOOL],
      tool_choice: { type: "tool", name: "structure_project" },
      messages: [{ role: "user", content: `Notes libres sur le projet :\n\n${notes}` }],
    }),
  });

  if (!anthropicRes.ok) {
    return json({ error: "anthropic_error", status: anthropicRes.status }, 502);
  }

  const anthropicData = await anthropicRes.json();
  const toolUse = anthropicData.content?.find(
    (block: { type: string }) => block.type === "tool_use",
  );
  if (!toolUse) return json({ error: "no_structured_output" }, 502);

  return json(toolUse.input);
});
