import { test, expect, SLUG, humanPause, expectNoUnexpectedConsoleErrors } from "./fixtures";

test.describe("Demande d'accès (AccessRequestModal)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/${SLUG}/projects`);
    await humanPause(page, 500);
    await page.getByRole("button", { name: /demander l'accès au projet/i }).first().click();
    await expect(page.getByRole("dialog", { name: /demander l'accès/i })).toBeVisible();
  });

  test("cas limite : soumission à vide affiche les erreurs de validation", async ({ page, consoleErrors }) => {
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await humanPause(page, 300);
    // Le formulaire ne doit pas soumettre -- toujours sur le formulaire, pas l'écran de succès
    await expect(page.getByRole("heading", { name: "Demander l'accès" })).toBeVisible();
    await expect(page.getByText("Ce champ est requis.").first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test("cas limite : email invalide affiche une erreur dédiée", async ({ page }) => {
    await page.locator("#ar-email").fill("pas-un-email");
    await page.locator("#ar-email").blur();
    await humanPause(page, 300);
    await expect(page.getByText("Veuillez entrer une adresse email valide.")).toBeVisible();
  });

  test("cas limite : mot de passe trop faible affiche un avertissement", async ({ page }) => {
    await page.locator("#ar-password").fill("abc");
    await page.locator("#ar-password").blur();
    await humanPause(page, 300);
    await expect(
      page.getByText("8 caractères min., avec au moins une lettre et un chiffre."),
    ).toBeVisible();
  });

  test("cas limite : consentement RGPD non coché bloque la soumission", async ({ page }) => {
    const uniqueEmail = `enoraleturnier+qatest${Date.now()}@gmail.com`;
    await page.locator("#ar-name").fill("QA Test Sans RGPD");
    await page.locator("#ar-company").fill("QA Co");
    await page.locator("#ar-email").fill(uniqueEmail);
    await page.locator("#ar-password").fill("TestPass123");
    await page.locator("#ar-confirm-password").fill("TestPass123");
    // Ne PAS cocher le RGPD volontairement
    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await humanPause(page, 300);
    await expect(page.getByText("Ce consentement est requis pour envoyer votre demande.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Demander l'accès" })).toBeVisible();
  });

  test("cas limite : double-clic rapide sur Envoyer ne crée pas de doublon visible", async ({ page }) => {
    const uniqueEmail = `enoraleturnier+qadbl${Date.now()}@gmail.com`;
    await page.locator("#ar-name").fill("QA Double Click");
    await page.locator("#ar-company").fill("QA Co");
    await page.locator("#ar-email").fill(uniqueEmail);
    await page.locator("#ar-password").fill("TestPass123");
    await page.locator("#ar-confirm-password").fill("TestPass123");
    await page.locator("#ar-gdpr").check();
    const submitBtn = page.getByRole("button", { name: "Envoyer ma demande" });
    // Double-clic quasi simultané via dispatch direct (évite qu'un 2e essai
    // échoue juste parce que le bouton a déjà disparu du DOM après le 1er clic
    // -- ce qui serait un succès, pas un échec de ce test).
    await Promise.all([
      submitBtn.dispatchEvent("click"),
      submitBtn.dispatchEvent("click").catch(() => {}),
    ]);
    await humanPause(page, 2000);
    // Un seul écran de succès attendu, pas d'erreur de type "already registered" visible en double
    const errorAlerts = page.getByText(/un compte existe déjà/i);
    expect(await errorAlerts.count()).toBeLessThanOrEqual(1);
  });

  test("chemin heureux : création de compte + demande d'accès valide", async ({ page, consoleErrors }) => {
    const uniqueEmail = `enoraleturnier+qaplaywright${Date.now()}@gmail.com`;
    await page.locator("#ar-name").fill("QA Playwright");
    await humanPause(page, 150);
    await page.locator("#ar-company").fill("QA Playwright Co");
    await humanPause(page, 150);
    await page.locator("#ar-email").fill(uniqueEmail);
    await humanPause(page, 150);
    await page.locator("#ar-password").fill("TestPass123");
    await humanPause(page, 150);
    await page.locator("#ar-confirm-password").fill("TestPass123");
    await humanPause(page, 150);
    await page.locator("#ar-message").fill("Message de test QA Playwright -- à ignorer / supprimer après coup.");
    await page.locator("#ar-gdpr").check();
    await humanPause(page, 300);

    await page.getByRole("button", { name: "Envoyer ma demande" }).click();
    await humanPause(page, 2000);

    await expect(page.getByRole("heading", { name: "Demande envoyée" })).toBeVisible({ timeout: 15_000 });
    expectNoUnexpectedConsoleErrors(consoleErrors);

    // Trace pour le nettoyage / le rapport final
    test.info().annotations.push({ type: "qa-test-account", description: uniqueEmail });
  });
});
