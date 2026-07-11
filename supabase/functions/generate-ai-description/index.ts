import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Mistral plutot qu'Anthropic pour raisons de cout (decision explicite, cf.
// CLAUDE.md) -- meme fonctionnalite (sortie JSON forcee), API OpenAI-style
// function calling au lieu du tool-use Anthropic : schema "tools" enveloppe
// dans {type: "function", function: {...}}, tool_choice: "any" (un seul outil
// declare de toute facon), et surtout function.arguments revient en JSON
// STRING a parser explicitement (Anthropic renvoyait deja un objet parse).
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY")!;
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

// Doit rester synchronise avec MAX_LENGTHS.probleme/decisions/resultat cote
// src/lib/projectValidation.ts -- pas d'import partage possible entre le
// bundle Vite (frontend) et le runtime Deno de l'Edge Function.
const FIELD_MAX_LENGTH = 1000;

const STRUCTURE_TOOL = {
  type: "function",
  function: {
    name: "structure_project",
    description:
      "Structure des notes libres de projet design en probleme/decisions/resultat, avec suggestions de tags.",
    parameters: {
      type: "object",
      properties: {
        probleme: {
          type: "string",
          description: `Le defi initial, en francais, concis. ${FIELD_MAX_LENGTH} caracteres maximum.`,
        },
        decisions: {
          type: "string",
          description: `Les choix strategiques faits, en francais, concis. ${FIELD_MAX_LENGTH} caracteres maximum.`,
        },
        resultat: {
          type: "string",
          description: `L'impact final et les retours, en francais, concis. ${FIELD_MAX_LENGTH} caracteres maximum.`,
        },
        tools_suggestions: { type: "array", items: { type: "string" }, description: "Outils probables (ex: Figma, Notion)." },
        keywords_suggestions: { type: "array", items: { type: "string" }, description: "Mots-cles courts pertinents." },
        types_suggestions: { type: "array", items: { type: "string" }, description: "Types de design concernes (ex: UX-UI, Branding)." },
      },
      required: ["probleme", "decisions", "resultat"],
    },
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

  if (!MISTRAL_API_KEY) return json({ error: "mistral_not_configured" }, 500);

  const mistralRes = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: `Tu structures les notes libres d'un designer freelance sur un projet, pour son portfolio. Reponds en francais, ton professionnel et concis. Chaque champ (probleme, decisions, resultat) doit imperativement faire ${FIELD_MAX_LENGTH} caracteres maximum -- reste bien en dessous plutot que de risquer de le depasser.`,
        },
        { role: "user", content: `Notes libres sur le projet :\n\n${notes}` },
      ],
      tools: [STRUCTURE_TOOL],
      tool_choice: "any",
    }),
  });

  if (!mistralRes.ok) {
    return json({ error: "mistral_error", status: mistralRes.status }, 502);
  }

  const mistralData = await mistralRes.json();
  const toolCall = mistralData.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return json({ error: "no_structured_output" }, 502);

  // Contrairement au tool-use Anthropic (input deja un objet parse), l'API
  // Mistral (format function-calling OpenAI-style) renvoie les arguments en
  // JSON string -- parsing explicite requis.
  let structured: Record<string, unknown>;
  try {
    structured = JSON.parse(toolCall.function.arguments);
  } catch {
    return json({ error: "invalid_tool_arguments" }, 502);
  }

  // Garde-fou cote code en plus de l'instruction de prompt : le modele peut
  // toujours depasser la consigne, donc troncature explicite avant de renvoyer
  // au client -- ne doit jamais faire confiance a la seule instruction du prompt.
  for (const field of ["probleme", "decisions", "resultat"] as const) {
    const value = structured[field];
    if (typeof value === "string" && value.length > FIELD_MAX_LENGTH) {
      structured[field] = value.slice(0, FIELD_MAX_LENGTH);
    }
  }

  return json(structured);
});
