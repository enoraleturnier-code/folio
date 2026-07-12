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
// Historique : 1000 -> 2500 -> 4000 (le chiffre-cible dans le prompt faisait
// converger le modele tout pres de la limite, coupe ensuite en plein mot par
// une troncature "dernier espace") -> revenu a 1000 sur demande produit,
// mais cette fois avec troncateToLastSentence() (derniere phrase complete,
// jamais en plein mot) au lieu de l'ancienne coupure au dernier espace --
// le probleme n'etait pas la valeur de la limite mais la qualite de la
// coupure quand elle se declenche.
const FIELD_MAX_LENGTH = 1000;
const SHORT_DESC_MAX_LENGTH = 160;

// max_tokens reste large malgre le retour a des champs plus courts : couvre
// confortablement 3 champs a 1000 caracteres + JSON overhead (echappement,
// cles, tableaux de suggestions) sans jamais etre le facteur limitant.
const MAX_OUTPUT_TOKENS = 3000;

/**
 * Troncature de secours si le modele depasse la limite malgre l'instruction
 * de prompt. Cherche la derniere ponctuation de fin de phrase (. ! ?) dans
 * la portion coupee et s'arrete juste apres -- jamais en plein mot ni en
 * pleine puce Markdown (cf. bug precedent : "- Tests utilisateurs
 * iteratifs** :" coupe apres les deux-points, sans suite). Si aucune
 * ponctuation de fin de phrase n'est trouvee dans une position raisonnable
 * (texte sans ponctuation, ou toute la ponctuation trop en amont), on
 * retombe sur le dernier espace -- pour ne jamais couper en plein mot, le
 * seul invariant qui ne souffre aucune exception.
 */
function truncateToLastSentence(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);

  let lastSentenceEnd = -1;
  for (let i = cut.length - 1; i >= 0; i--) {
    if (cut[i] === "." || cut[i] === "!" || cut[i] === "?") {
      lastSentenceEnd = i;
      break;
    }
  }
  if (lastSentenceEnd > max * 0.5) {
    return cut.slice(0, lastSentenceEnd + 1).trimEnd();
  }

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
          description: `Le defi initial, en francais, avec formatage Markdown (gras, listes) si pertinent. ${FIELD_MAX_LENGTH} caracteres maximum -- termine imperativement sur une phrase complete, jamais en plein mot.`,
        },
        decisions: {
          type: "string",
          description: `Les choix strategiques faits, en francais, avec formatage Markdown (gras, listes) si pertinent. ${FIELD_MAX_LENGTH} caracteres maximum -- termine imperativement sur une phrase complete, jamais en plein mot.`,
        },
        resultat: {
          type: "string",
          description: `L'impact final et les retours, en francais, avec formatage Markdown (gras, listes) si pertinent. ${FIELD_MAX_LENGTH} caracteres maximum -- termine imperativement sur une phrase complete, jamais en plein mot.`,
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
          content: `Tu structures la description longue d'un projet design d'un designer freelance, pour son portfolio. Reponds en francais, ton professionnel. Le champ short_desc doit imperativement faire ${SHORT_DESC_MAX_LENGTH} caracteres maximum (prose simple, sans Markdown, affiche tel quel en texte brut) -- contrainte stricte a respecter. Pour probleme, decisions et resultat, reste imperativement sous ${FIELD_MAX_LENGTH} caracteres chacun : termine toujours sur une phrase complete, jamais en plein mot ni en pleine puce -- quitte a etre plus concis ou a omettre un dernier point secondaire pour tenir dans la limite tout en finissant proprement. Utilise le Markdown pour structurer ces 3 champs : **gras** pour les termes-cles et chiffres importants, listes a puces ("- item") si pertinent pour enumerer plusieurs decisions ou plusieurs resultats -- mais la limite de caracteres et la phrase complete priment toujours sur le formatage. Ces 3 champs sont rendus par un moteur Markdown cote portfolio (react-markdown), donc la syntaxe sera affichee formatee, jamais telle quelle.`,
        },
        { role: "user", content: `Description longue du projet :\n\n${longDesc}` },
      ],
      tools: [STRUCTURE_TOOL],
      tool_choice: "any",
      max_tokens: MAX_OUTPUT_TOKENS,
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
      structured[field] = truncateToLastSentence(value, FIELD_MAX_LENGTH);
    }
  }
  if (typeof structured.short_desc === "string" && structured.short_desc.length > SHORT_DESC_MAX_LENGTH) {
    structured.short_desc = truncateToLastSentence(structured.short_desc, SHORT_DESC_MAX_LENGTH);
  }

  return json(structured);
});
