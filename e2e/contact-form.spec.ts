import { test, expect, SLUG, humanPause, humanScroll } from "./fixtures";

test.describe("Formulaire de contact (ContactForm)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}#contact`);
    await humanPause(page, 600);
    await humanScroll(page, 3);
    await expect(page.locator("#cf-name")).toBeVisible();
  });

  test("cas limite : le bouton Envoyer reste désactivé tant que le RGPD n'est pas coché", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  test("cas limite : soumission avec RGPD coché mais champs vides affiche 3 erreurs de champ", async ({
    page,
    consoleErrors,
  }) => {
    // Le bouton n'est désactivé que par le RGPD -- une fois coché, les champs
    // vides doivent être rattrapés par la validation au submit.
    await page.getByLabel(/j'accepte que mes données/i).check();
    await page.getByRole("button", { name: "Envoyer" }).click();
    await humanPause(page, 300);
    await expect(page.getByText("Le champ Nom est obligatoire.")).toBeVisible();
    await expect(page.getByText("Le champ Email est obligatoire.")).toBeVisible();
    await expect(page.getByText("Le champ Message est obligatoire.")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("cas limite : appui sur Entrée avec RGPD non coché -- le message d'erreur RGPD est-il jamais atteignable ?", async ({
    page,
  }) => {
    await page.locator("#cf-name").fill("QA Enter Key");
    await page.locator("#cf-email").fill(`enoraleturnier+qaenter${Date.now()}@gmail.com`);
    await page.locator("#cf-message").fill("Test appui Entrée.");
    // RGPD volontairement non coché -- le bouton Envoyer est disabled, donc
    // un clic est impossible. On teste si Entrée dans un champ contourne ça.
    await page.locator("#cf-message").press("Enter");
    await humanPause(page, 400);
    const rgpdError = page.getByText("Ce consentement est requis pour envoyer votre message.");
    const isVisible = await rgpdError.isVisible().catch(() => false);
    test
      .info()
      .annotations.push({
        type: "qa-observation",
        description: isVisible
          ? "Entrée contourne le bouton disabled -- le message RGPD est bien atteignable au clavier."
          : "Le message d'erreur RGPD (cf-rgpd-error) semble inatteignable : le bouton Envoyer étant disabled tant que rgpd=false, ni le clic ni Entrée ne déclenchent handleSubmit -- code potentiellement mort, et aucun feedback clavier pour un utilisateur qui n'a pas coché la case.",
      });
  });

  test("cas limite : email invalide", async ({ page }) => {
    await page.locator("#cf-name").fill("QA Tester");
    await page.locator("#cf-email").fill("pas-un-email-valide");
    await page.locator("#cf-message").fill("Un message de test.");
    await page.getByLabel(/j'accepte que mes données/i).check();
    await page.getByRole("button", { name: "Envoyer" }).click();
    await humanPause(page, 300);
    await expect(page.getByText("Le format de l'email n'est pas valide.")).toBeVisible();
  });

  test("cas limite : message très long (2000+ caractères) accepté sans crash", async ({
    page,
    consoleErrors,
  }) => {
    const longMessage = "Ceci est un message de test QA très long. ".repeat(60); // ~2600 caractères
    await page.locator("#cf-name").fill("QA Long Message");
    await page.locator("#cf-email").fill(`enoraleturnier+qalong${Date.now()}@gmail.com`);
    await page.locator("#cf-message").fill(longMessage);
    await page.getByLabel(/j'accepte que mes données/i).check();
    await humanPause(page, 300);
    await page.getByRole("button", { name: "Envoyer" }).click();
    await humanPause(page, 2500);
    await expect(page.getByText("Merci • message reçu.")).toBeVisible({ timeout: 15_000 });
    expect(consoleErrors, "Erreurs console avec un message très long").toEqual([]);
  });

  test("chemin heureux : soumission valide affiche la confirmation et vide le formulaire", async ({
    page,
    consoleErrors,
  }) => {
    const email = `enoraleturnier+qacontact${Date.now()}@gmail.com`;
    await page.locator("#cf-name").fill("QA Playwright Contact");
    await humanPause(page, 150);
    await page.locator("#cf-email").fill(email);
    await humanPause(page, 150);
    await page.locator("#cf-message").fill("Message de test QA Playwright (contact) -- à ignorer.");
    await humanPause(page, 150);
    await page.getByLabel(/j'accepte que mes données/i).check();
    await humanPause(page, 300);

    await page.getByRole("button", { name: "Envoyer" }).click();
    await humanPause(page, 2500);

    await expect(page.getByText("Merci • message reçu.")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#cf-name")).toHaveValue("");
    await expect(page.locator("#cf-email")).toHaveValue("");
    expect(consoleErrors).toEqual([]);
  });
});
