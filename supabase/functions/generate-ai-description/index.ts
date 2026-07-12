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

// Doit rester synchronise avec MAX_LENGTHS.probleme/decisions/resultat/short_desc
// cote src/lib/projectValidation.ts -- pas d'import partage possible entre le
// bundle Vite (frontend) et le runtime Deno de l'Edge Function.
const FIELD_MAX_LENGTH = 1000;
const SHORT_DESC_MAX_LENGTH = 160;

/**
 * Troncature de secours si le modele depasse la limite malgre l'instruction
 * de prompt. Un slice() brut coupait parfois en plein milieu d'un mot (ou
 * d'un marqueur Markdown genre "**"), ce qui donnait l'impression que le
 * texte etait tronque de facon abrupte cote affichage (probleme signale).
 * On recule jusqu'au dernier espace pour finir sur un mot complet, sauf si
 * ca reviendrait a jeter plus de la moitie du texte (texte sans espaces,
 * ou coupure trop en amont) -- dans ce cas on garde la coupure brute plutot
 * que de perdre une portion excessive du contenu.
 */
function truncateSafely(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > max * 0.5 ? cut.slice(0, lastSpace).trimEnd() : cut.trimEnd();
}

const STRUCTURE_TOOL = {
  type: "function",
  function: {
    name: "structure_project",
    description:
      "Structure la description longue d'un projet design en short_desc + probleme/decisions/resultat, avec suggestions de tags.",
    parameters: {
      type: "object",
      properties: {
        short_desc: {
          type: "string",
          description: `Accroche courte pour une carte teaser, en francais. ${SHORT_DESC_MAX_LENGTH} caracteres maximum.`,
        },
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
      required: ["short_desc", "probleme", "decisions", "resultat"],
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

  let longDesc: string | undefined;
  try {
    const body = await req.json();
    longDesc = body?.long_desc;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }
  if (!longDesc || typeof longDesc !== "string" || !longDesc.trim()) {
    return json({ error: "missing_long_desc" }, 400);
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
          content: `Tu structures la description longue d'un projet design d'un designer freelance, pour son portfolio. Reponds en francais, ton professionnel et concis. Le champ short_desc doit imperativement faire ${SHORT_DESC_MAX_LENGTH} caracteres maximum, et chaque champ (probleme, decisions, resultat) ${FIELD_MAX_LENGTH} caracteres maximum -- reste bien en dessous plutot que de risquer de le depasser. N'utilise aucun formatage Markdown (pas d'astérisques **, pas de listes numerotees ou a puces, pas de titres) : ces champs sont affiches tels quels en texte brut, jamais interpretes comme du Markdown -- ecris des paragraphes de prose simple.`,
        },
        { role: "user", content: `Description longue du projet :\n\n${longDesc}` },
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
      structured[field] = truncateSafely(value, FIELD_MAX_LENGTH);
    }
  }
  if (typeof structured.short_desc === "string" && structured.short_desc.length > SHORT_DESC_MAX_LENGTH) {
    structured.short_desc = truncateSafely(structured.short_desc, SHORT_DESC_MAX_LENGTH);
  }

  return json(structured);
});
