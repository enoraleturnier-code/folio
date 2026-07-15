import { test as base, expect, type Page } from "@playwright/test";

export const SLUG = "lea-martin";

// Comptes seed du projet (PersonaSwitcher.tsx, deja utilises cette session
// -- confirmes explicitement par l'utilisatrice pour cette session de QA).
export const PERSONAS = {
  admin: { email: "enoraleturnier+lea-persona@gmail.com", password: "Test1234!", name: "Léa Martin" },
  pending: { email: "enoraleturnier+sophie-persona@gmail.com", password: "Test1234!", name: "Sophie Michelle" },
  validated: { email: "enoraleturnier+karim-persona@gmail.com", password: "Test1234!", name: "Karim Mansouri" },
} as const;

type Fixtures = {
  consoleErrors: string[];
};

export const test = base.extend<Fixtures>({
  // Capture toute erreur console/JS pendant le test, meme si l'ecran a l'air
  // normal -- attache au rapport HTML Playwright pour le retrouver facilement.
  consoleErrors: async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
    page.on("requestfailed", (req) => {
      const failure = req.failure();
      if (failure && !failure.errorText.includes("net::ERR_ABORTED")) {
        errors.push(`[requestfailed] ${req.method()} ${req.url()} -- ${failure.errorText}`);
      }
    });
    await use(errors);
    if (errors.length > 0) {
      await testInfo.attach("console-errors.txt", { body: errors.join("\n"), contentType: "text/plain" });
    }
  },
});

export { expect };

/** Petites pauses/scrolls pour un parcours moins "robotique" -- observation visuelle plus fidele a un vrai humain, pas juste des clics instantanes. */
export async function humanPause(page: Page, ms = 350) {
  await page.waitForTimeout(ms);
}

export async function humanScroll(page: Page, steps = 3, amount = 280) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, amount);
    await page.waitForTimeout(220);
  }
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await humanPause(page);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await humanPause(page, 200);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await humanPause(page, 200);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

export async function logout(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Ouvre le modal de demande d'accès sur le 1er projet confidentiel disponible
 * et soumet un nouveau compte -- retourne l'email utilisé.
 *
 * Bug connu (cf. rapport QA) : une race condition entre le flux inline
 * d'AccessRequestModal.handleSubmit et l'écoute globale SIGNED_IN de
 * RootLayout (submitPendingAccessRequest) peut faire échouer la soumission de
 * façon intermittente (409 / duplicate key sur access_requests) -- parfois une
 * simple erreur console silencieuse, parfois un échec visible pour
 * l'utilisateur. Volontairement PAS de retry ici : un flux qui échoue par
 * intermittence doit se voir dans le rapport, pas être masqué.
 */
export async function submitFreshAccessRequest(page: Page, label = "qaadmin"): Promise<string> {
  const email = `enoraleturnier+${label}${Date.now()}@gmail.com`;
  await page.goto(`/${SLUG}/projects`);
  await humanPause(page, 500);
  await page.getByRole("button", { name: /demander l'accès au projet/i }).first().click();
  await expect(page.getByRole("dialog", { name: /demander l'accès/i })).toBeVisible();
  await page.locator("#ar-name").fill("QA Admin Flow");
  await page.locator("#ar-company").fill("QA Admin Co");
  await page.locator("#ar-email").fill(email);
  await page.locator("#ar-password").fill("TestPass123");
  await page.locator("#ar-confirm-password").fill("TestPass123");
  await page.locator("#ar-gdpr").check();
  await humanPause(page, 300);
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible({ timeout: 15_000 });
  return email;
}

/** Soumet le formulaire de contact public avec un email unique -- retourne l'email utilisé. */
export async function submitFreshContact(page: Page, label = "qaadmincontact"): Promise<string> {
  const email = `enoraleturnier+${label}${Date.now()}@gmail.com`;
  await page.goto(`/${SLUG}#contact`);
  await humanPause(page, 500);
  await page.locator("#cf-name").fill("QA Admin Contact");
  await page.locator("#cf-email").fill(email);
  await page.locator("#cf-message").fill("Message de test QA (flux admin) -- à ignorer.");
  await page.getByLabel(/j'accepte que mes données/i).check();
  await humanPause(page, 300);
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("Merci • message reçu.")).toBeVisible({ timeout: 15_000 });
  return email;
}
