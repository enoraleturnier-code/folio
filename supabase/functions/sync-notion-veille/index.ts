import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Double chemin d'auth : le bouton manuel ("Forcer une synchro maintenant") doit
// verifier role=admin explicitement (meme pattern que generate-ai-description --
// un JWT valide via verify_jwt:true authentifie mais n'autorise pas), mais le job
// pg_cron n'a aucune session utilisateur a fournir.
//
// Le chemin cron s'authentifie via un header `x-cron-secret` partage uniquement
// avec le job pg_cron -- stocke a la fois en Supabase Vault (cote DB, lu par la
// migration du job cron) et en secret Edge Function (Deno.env, lu ici). Les deux
// copies portent la meme valeur, jamais committee en clair dans le code source.
const CRON_SYNC_SECRET = Deno.env.get("CRON_SYNC_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");

// Data source (pas l'ancien id de "database") : la base "Veille Design Hebdo"
// expose ses lignes via l'API Notion "Data Sources" (version 2025-09-03) --
// confirme par l'introspection MCP (tags <data-source url="collection://...">).
// Si l'appel echoue une fois la cle reelle configuree, verifier d'abord ce point
// (endpoint/version) avant de suspecter la cle elle-meme.
const NOTION_DATA_SOURCE_ID = "7adb6e86-9c99-829a-9377-87e38d7241b8";
const NOTION_VERSION = "2025-09-03";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

interface NotionPropertyValue {
  title?: { plain_text: string }[];
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  date?: { start: string; end: string | null } | null;
  number?: number | null;
}

interface NotionPage {
  id: string;
  url: string;
  properties: Record<string, NotionPropertyValue>;
}

// Miroir adapte au schema reel Notion (verifie via MCP, different de la spec
// initiale) : pas de colonne "source"/"date_publication" uniques -- chaque ligne
// est une synthese hebdomadaire agregeant plusieurs sources sur une periode.
function mapNotionPage(page: NotionPage, contenu: string) {
  const props = page.properties;
  const titre: string = props["Titre"]?.title?.[0]?.plain_text ?? "(sans titre)";
  const statut: string = props["Statut"]?.select?.name ?? "Brouillon";
  const tags: string[] = (props["Tags"]?.multi_select ?? []).map((t: { name: string }) => t.name);
  const periode_debut: string | null = props["Période"]?.date?.start ?? null;
  const periode_fin: string | null =
    props["Période"]?.date?.end ?? props["Période"]?.date?.start ?? null;
  const nb_sources: number | null =
    typeof props["Nombre de sources"]?.number === "number"
      ? props["Nombre de sources"].number
      : null;

  return {
    notion_page_id: page.id,
    titre,
    statut,
    tags,
    periode_debut,
    periode_fin,
    nb_sources,
    notion_url: page.url,
    contenu,
    synced_at: new Date().toISOString(),
  };
}

interface NotionRichText {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
}

interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
}

function richTextToMarkdown(richText: NotionRichText[] | undefined): string {
  if (!richText || richText.length === 0) return "";
  return richText
    .map((rt) => {
      let text = rt.plain_text;
      if (rt.annotations?.code) text = `\`${text}\``;
      if (rt.annotations?.bold) text = `**${text}**`;
      if (rt.annotations?.italic) text = `*${text}*`;
      if (rt.annotations?.strikethrough) text = `~~${text}~~`;
      if (rt.href) text = `[${text}](${rt.href})`;
      return text;
    })
    .join("");
}

/** Best-effort : le contenu enrichit l'affichage (Dashboard) mais ne doit jamais faire echouer la synchro. */
async function fetchBlockChildren(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": NOTION_VERSION,
      },
    });
    if (!res.ok) break;
    const data = await res.json();
    blocks.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

// Convertit les blocs Notion (paragraphes/titres/listes) en Markdown -- reutilise
// tel quel par MarkdownContent.tsx cote dashboard. Couvre les types de blocs
// reellement utilises par la synthese Cowork (titres, paragraphes, listes a
// puces/numerotees) ; les types non geres retombent sur leur texte brut.
function blocksToMarkdown(blocks: NotionBlock[]): string {
  const lines: string[] = [];
  let numberedIndex = 0;
  for (const block of blocks) {
    const data = (block as Record<string, { rich_text?: NotionRichText[] }>)[block.type];
    const text = richTextToMarkdown(data?.rich_text);
    let line: string | null = null;
    let isNumbered = false;
    switch (block.type) {
      case "heading_1":
        line = `# ${text}`;
        break;
      case "heading_2":
        line = `## ${text}`;
        break;
      case "heading_3":
        line = `### ${text}`;
        break;
      case "bulleted_list_item":
        line = `- ${text}`;
        break;
      case "numbered_list_item":
        numberedIndex += 1;
        isNumbered = true;
        line = `${numberedIndex}. ${text}`;
        break;
      case "quote":
        line = `> ${text}`;
        break;
      case "divider":
        line = "---";
        break;
      default:
        line = text || null;
    }
    if (!isNumbered) numberedIndex = 0;
    if (line !== null) lines.push(line);
  }
  return lines.join("\n\n");
}

async function fetchAllNotionPages(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${NOTION_DATA_SOURCE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 },
        ),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`notion_${res.status}: ${detail}`);
    }
    const data = await res.json();
    pages.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cronSecret = req.headers.get("x-cron-secret");
  const isCron = cronSecret !== null && cronSecret === CRON_SYNC_SECRET;

  if (!isCron) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_auth" }, 401);
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: role, error: roleError } = await callerClient.rpc("get_my_role");
    if (roleError || role !== "admin") return json({ error: "forbidden" }, 403);
  }

  if (!NOTION_API_KEY) return json({ error: "notion_not_configured" }, 500);

  let notionPages: NotionPage[];
  try {
    notionPages = await fetchAllNotionPages();
  } catch (err) {
    return json({ error: "notion_fetch_failed", detail: String(err) }, 502);
  }

  // Sequentiel (pas Promise.all) : reste raisonnable face aux limites de debit de
  // l'API Notion, le volume attendu est faible (une entree par semaine).
  const rows = [];
  for (const page of notionPages) {
    const blocks = await fetchBlockChildren(page.id).catch(() => []);
    rows.push(mapNotionPage(page, blocksToMarkdown(blocks)));
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error: upsertError } = await admin
    .from("design_watch_entries")
    .upsert(rows, { onConflict: "notion_page_id" });

  if (upsertError) return json({ error: "upsert_failed", detail: upsertError.message }, 500);

  return json({ synced: rows.length, timestamp: new Date().toISOString() });
});
