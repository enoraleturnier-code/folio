// One-off cleanup: remove the test auth user created by test-webhook-welcome.mjs.
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

const { error } = await admin.auth.admin.deleteUser("266887f3-4682-4374-8094-8fcfff98d9a7");

if (error) {
  console.error("FAIL:", error.message);
  process.exit(1);
}

console.log("OK deleted test user 266887f3-4682-4374-8094-8fcfff98d9a7");
