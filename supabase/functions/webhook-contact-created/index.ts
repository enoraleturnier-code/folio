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

// Audit securite 15/07 (RAPPORT_SECURITE.md) : record.name/email/message viennent
// du formulaire de contact public (n'importe quel visiteur anonyme) et etaient
// interpoles tels quels dans le HTML des emails -- echappement pour empecher
// toute injection HTML (liens de phishing, images de tracking) dans l'email
// envoye a l'admin.
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

  const { data: admins } = await supabase.from("user_profiles").select("email").eq("role", "admin");

  const results: Record<string, unknown> = {};

  const safeName = escapeHtml(record.name || "");
  const safeEmail = escapeHtml(record.email);
  const safeMessage = escapeHtml(record.message || "");

  const visitorHtml = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Message bien reçu</h2>
      <p>Bonjour ${safeName},</p>
      <p>Votre message a bien été transmis. Vous recevrez une réponse dans les meilleurs délais.</p>
      <p>L'équipe Folio+</p>
    </div>
  `;
  results.visitor = await sendEmail(record.email, "Votre message a bien été reçu", visitorHtml);

  if (admins?.length) {
    const adminHtml = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Nouveau message de contact</h2>
        <p><strong>${safeName}</strong> (${safeEmail}) a envoyé un message :</p>
        <blockquote>${safeMessage}</blockquote>
      </div>
    `;
    results.admins = await Promise.all(
      admins.map((a: { email: string }) => sendEmail(a.email, "Nouveau message de contact", adminHtml)),
    );
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
