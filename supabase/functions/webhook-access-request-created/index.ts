import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Audit securite 15/07 : voir webhook-welcome-email/index.ts pour le detail
// -- meme check, meme secret partage (Vault) verifie via RPC service_role.
async function isAuthorizedDispatch(req: Request): Promise<boolean> {
  const provided = req.headers.get("x-webhook-secret");
  if (!provided) return false;
  const { data: expected } = await supabase.rpc("get_webhook_dispatch_secret");
  return typeof expected === "string" && expected.length > 0 && provided === expected;
}

function normalizeGmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const d = domain.toLowerCase();
  if (d === "gmail.com" || d === "googlemail.com") {
    return `${local.split("+")[0]}@${d}`;
  }
  return email;
}

// Audit securite 15/07 (RAPPORT_SECURITE.md) : full_name/title viennent de
// donnees utilisateur (inscription) et etaient interpoles tels quels dans le
// HTML des emails -- echappement pour empecher toute injection HTML.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Folio+ <onboarding@resend.dev>",
      to: normalizeGmail(to),
      subject,
      html,
    }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

Deno.serve(async (req: Request) => {
  if (!(await isAuthorizedDispatch(req))) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await req.json();
  const record = payload.record;

  if (!record?.user_id || !record?.project_id) {
    return new Response(JSON.stringify({ error: "missing user_id/project_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [{ data: visitor }, { data: project }, { data: admins }] = await Promise.all([
    supabase.from("user_profiles").select("email, full_name").eq("id", record.user_id).single(),
    supabase.from("projects").select("title").eq("id", record.project_id).single(),
    supabase.from("user_profiles").select("email, full_name").eq("role", "admin"),
  ]);

  const results: Record<string, unknown> = {};
  const safeTitle = escapeHtml(project?.title || "");
  const safeVisitorName = escapeHtml(visitor?.full_name || visitor?.email || "Un visiteur");

  if (visitor?.email) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Demande envoyée</h2>
        <p>Bonjour ${escapeHtml(visitor.full_name || "")},</p>
        <p>Votre demande d'accès au projet <strong>${safeTitle || "confidentiel"}</strong> est en cours de traitement. Vous recevrez une réponse dès qu'elle sera traitée.</p>
        <p>L'équipe Folio+</p>
      </div>
    `;
    results.visitor = await sendEmail(visitor.email, "Votre demande d'accès est en cours", html);
  }

  if (admins?.length) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Nouvelle demande d'accès</h2>
        <p>${safeVisitorName} demande l'accès au projet <strong>${safeTitle}</strong>.</p>
        <p>Rendez-vous dans le back-office pour la traiter.</p>
      </div>
    `;
    results.admins = await Promise.all(
      admins.map((a: { email: string }) => sendEmail(a.email, "Nouvelle demande d'accès", html)),
    );
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
