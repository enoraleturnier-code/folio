import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Audit securite 15/07 : verify_jwt:true a la gateway n'accepte "une cle
// Supabase valide" -- la cle publique passe ce test, donc sans ce check
// n'importe qui pouvait appeler cette fonction directement et envoyer un
// email a l'adresse de son choix. webhook_dispatch_secret (Vault) n'est
// connu que de dispatch_webhook() et de get_webhook_dispatch_secret()
// (EXECUTE reserve a service_role, cf. migration dediee).
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

// Audit securite 15/07 (RAPPORT_SECURITE.md) : record.full_name est fourni par
// l'utilisateur a l'inscription et etait interpole tel quel dans le HTML de
// l'email -- echappement pour empecher toute injection HTML (liens de
// phishing, images de tracking) dans un email envoye par Folio+.
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

  if (!record?.email) {
    return new Response(JSON.stringify({ error: "missing record.email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = escapeHtml(record.full_name || "bienvenue");
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Bienvenue sur Folio+, ${name} !</h2>
      <p>Votre compte a bien été créé. Vous pouvez désormais consulter le catalogue de projets et demander l'accès aux projets confidentiels qui vous intéressent.</p>
      <p>À bientôt,<br/>L'équipe Folio+</p>
    </div>
  `;

  const result = await sendEmail(record.email, "Bienvenue sur Folio+", html);

  return new Response(JSON.stringify({ sent: result.status === 200, result }), {
    status: result.status === 200 ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
});
