import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

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

Deno.serve(async (req: Request) => {
  const payload = await req.json();
  const record = payload.record;

  if (!record?.email) {
    return new Response(JSON.stringify({ error: "missing record.email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = record.full_name || "bienvenue";
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
