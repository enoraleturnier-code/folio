// One-off test: create a real auth user to exercise the full on_auth_user_created ->
// handle_new_user() -> user_profiles INSERT -> trg_webhook_welcome_email chain end-to-end.
// Usage: node scripts/test-webhook-welcome.mjs
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

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email: "enoraleturnier+webhook-welcome-test@gmail.com",
  password: "Test1234!",
  email_confirm: true,
  user_metadata: { full_name: "Webhook Test User" },
});

if (error) {
  console.error("FAIL:", error.message);
  process.exit(1);
}

console.log(`OK created user ${data.user.id} (${data.user.email})`);
