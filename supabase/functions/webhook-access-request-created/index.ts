import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function normalizeGmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const d = domain.toLowerCase();
  if (d === "gmail.com" || d === "googlemail.com") {
    return `${local.split("+")[0]}@${d}`;
  }
  return email;
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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req: Request) => {
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

  if (visitor?.email) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Demande envoyée</h2>
        <p>Bonjour ${visitor.full_name || ""},</p>
        <p>Votre demande d'accès au projet <strong>${project?.title || "confidentiel"}</strong> est en cours de traitement. Vous recevrez une réponse dès qu'elle sera traitée.</p>
        <p>L'équipe Folio+</p>
      </div>
    `;
    results.visitor = await sendEmail(visitor.email, "Votre demande d'accès est en cours", html);
  }

  if (admins?.length) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Nouvelle demande d'accès</h2>
        <p>${visitor?.full_name || visitor?.email || "Un visiteur"} demande l'accès au projet <strong>${project?.title || ""}</strong>.</p>
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
