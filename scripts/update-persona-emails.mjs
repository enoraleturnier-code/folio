// One-off admin script: rename persona test account emails via the Supabase Admin API
// (auth.admin.updateUserById) instead of raw SQL on auth.users, to keep auth.identities in sync.
// Usage: node scripts/update-persona-emails.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(path) {
  const out = {};
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

const baseEnv = loadEnvFile(join(root, ".env"));
const adminEnv = loadEnvFile(join(root, ".env.admin"));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || baseEnv.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || adminEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing VITE_SUPABASE_URL (from .env) or SUPABASE_SERVICE_ROLE_KEY (from .env.admin).",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// id captured beforehand via read-only SELECT on auth.users, to verify UUID stability after update
const updates = [
  { id: "469dd567-bbf1-40e7-8c0b-c14dc7107f9e", oldEmail: "sophie@folioplus.app", newEmail: "enoraleturnier+sophie-persona@gmail.com" },
  { id: "f06a6e42-2ce7-4e6e-9563-0315b0102cbb", oldEmail: "karim@folioplus.app", newEmail: "enoraleturnier+karim-persona@gmail.com" },
  { id: "b2c7b021-0699-4cf0-b5bb-88c7074fb67c", oldEmail: "lea@folioplus.app", newEmail: "enoraleturnier+lea-persona@gmail.com" },
  { id: "4d162cc9-3359-43bd-8dd0-0184ed8003a9", oldEmail: "jean@app.com", newEmail: "enoraleturnier+jean@gmail.com" },
  { id: "56f1815a-30c8-43fc-8a5f-a25abe5a55aa", oldEmail: "sandra@app.com", newEmail: "enoraleturnier+sandra@gmail.com" },
];

for (const { id, oldEmail, newEmail } of updates) {
  const { data, error } = await admin.auth.admin.updateUserById(id, {
    email: newEmail,
    email_confirm: true,
  });
  if (error) {
    console.error(`FAIL ${oldEmail} (${id}) -> ${newEmail}:`, error.message);
    continue;
  }
  const returnedId = data.user.id;
  const returnedEmail = data.user.email;
  const uuidStable = returnedId === id;
  console.log(
    `${uuidStable ? "OK" : "UUID MISMATCH"} ${oldEmail} -> ${returnedEmail} (id ${returnedId}, stable=${uuidStable})`,
  );
}
