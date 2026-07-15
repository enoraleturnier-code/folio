import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Audit securite 15/07 : voir webhook-welcome-email/index.ts pour le detail
// -- meme check, meme secret partage (Vault) verifie via RPC service_role.
// Audit securite 16/07 : voir webhook-welcome-email/index.ts pour le detail --
// comparaison en temps constant du secret partage.
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

async function isAuthorizedDispatch(req: Request): Promise<boolean> {
  const provided = req.headers.get("x-webhook-secret");
  if (!provided) return false;
  const { data: expected } = await supabase.rpc("get_webhook_dispatch_secret");
  return typeof expected === "string" && expected.length > 0 && timingSafeEqual(provided, expected);
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

// Audit securite 15/07 (RAPPORT_SECURITE.md) : full_name/title/rejection_reason
// viennent de donnees utilisateur/admin et etaient interpoles tels quels dans
// le HTML des emails -- echappement pour empecher toute injection HTML.
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
  const oldRecord = payload.old_record;

  if (!record?.user_id || !record?.project_id) {
    return new Response(JSON.stringify({ error: "missing user_id/project_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (oldRecord?.status !== "pending" || !["approved", "rejected"].includes(record.status)) {
    return new Response(JSON.stringify({ skipped: true, reason: "not a pending->approved/rejected transition" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const [{ data: visitor }, { data: project }] = await Promise.all([
    supabase.from("user_profiles").select("email, full_name").eq("id", record.user_id).single(),
    supabase.from("projects").select("title").eq("id", record.project_id).single(),
  ]);

  if (!visitor?.email) {
    return new Response(JSON.stringify({ error: "visitor not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  let subject: string;
  let html: string;
  const safeFullName = escapeHtml(visitor.full_name || "");
  const safeTitle = escapeHtml(project?.title || "");

  if (record.status === "approved") {
    subject = "Accès accordé";
    html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Accès accordé</h2>
        <p>Bonjour ${safeFullName},</p>
        <p>Votre demande d'accès au projet <strong>${safeTitle}</strong> a été validée. Vous pouvez désormais consulter la fiche complète.</p>
        <p>L'équipe Folio+</p>
      </div>
    `;
  } else {
    subject = "Votre demande a été refusée";
    html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Demande refusée</h2>
        <p>Bonjour ${safeFullName},</p>
        <p>Votre demande d'accès au projet <strong>${safeTitle}</strong> a été refusée.</p>
        ${record.rejection_reason ? `<p><strong>Raison :</strong> ${escapeHtml(record.rejection_reason)}</p>` : ""}
        <p>L'équipe Folio+</p>
      </div>
    `;
  }

  const result = await sendEmail(visitor.email, subject, html);

  return new Response(JSON.stringify({ sent: result.status === 200, result }), {
    status: result.status === 200 ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
});
