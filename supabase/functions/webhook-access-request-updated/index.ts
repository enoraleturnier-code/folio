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

  if (record.status === "approved") {
    subject = "Accès accordé";
    html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Accès accordé</h2>
        <p>Bonjour ${visitor.full_name || ""},</p>
        <p>Votre demande d'accès au projet <strong>${project?.title || ""}</strong> a été validée. Vous pouvez désormais consulter la fiche complète.</p>
        <p>L'équipe Folio+</p>
      </div>
    `;
  } else {
    subject = "Votre demande a été refusée";
    html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Demande refusée</h2>
        <p>Bonjour ${visitor.full_name || ""},</p>
        <p>Votre demande d'accès au projet <strong>${project?.title || ""}</strong> a été refusée.</p>
        ${record.rejection_reason ? `<p><strong>Raison :</strong> ${record.rejection_reason}</p>` : ""}
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
