import { chromium, type FullConfig } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// La preview Vercel est derriere Vercel Authentication -- ce lien
// _vercel_share (genere via le connecteur Vercel, valable 23h, un par run)
// pose un cookie de bypass qu'on capture une fois ici et qu'on reutilise pour
// tous les tests via `storageState` (cf. playwright.config.ts). Jamais de
// valeur en dur ici : c'est un token d'acces vivant, meme s'il expire vite --
// toujours fourni via variable d'env, jamais commit.
const SHARE_URL = process.env.QA_SHARE_URL;

const STORAGE_STATE_PATH = "./e2e/.auth/vercel-bypass.json";

export default async function globalSetup(_config: FullConfig) {
  if (!SHARE_URL) {
    throw new Error(
      "QA_SHARE_URL manquant -- genere un lien de bypass Vercel Authentication " +
        "(get_access_to_vercel_url sur l'URL de preview a tester) et exporte-le : " +
        "QA_SHARE_URL=\"https://...?_vercel_share=...\" npx playwright test",
    );
  }
  mkdirSync(dirname(STORAGE_STATE_PATH), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(SHARE_URL, { waitUntil: "networkidle" });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
}
