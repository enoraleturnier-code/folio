// One-off admin script: delete an auth user by id via the Supabase Admin API.
// Usage: node scripts/delete-auth-user.mjs <user-id>
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

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: node scripts/delete-auth-user.mjs <user-id>");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await admin.auth.admin.deleteUser(userId);

if (error) {
  console.error("FAIL:", error.message);
  process.exit(1);
}

console.log(`OK deleted user ${userId}`);
