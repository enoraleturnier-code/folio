import {
  test,
  expect,
  PERSONAS,
  humanPause,
  login,
  logout,
  submitFreshAccessRequest,
  submitFreshContact,
} from "./fixtures";

test.describe("Dashboard admin (Léa)", () => {
  test("flux complet : créer une fausse demande de test, puis la valider en admin", async ({
    page,
    consoleErrors,
  }) => {
    // 1) Anon : crée une nouvelle demande d'accès de test (nouveau compte, pas de vraie donnée touchée)
    const testEmail = await submitFreshAccessRequest(page, "qaadminacces");
    await logout(page);

    // 2) Login admin
    await login(page, PERSONAS.admin.email, PERSONAS.admin.password);
    await humanPause(page, 1500);
    await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

    // 3) Onglet "Accès" (demandes)
    await page.goto("/admin?tab=demandes");
    await humanPause(page, 800);
    await expect(page.getByRole("heading", { name: /accès|demandes/i }).first()).toBeVisible();

    // Carte de demande = <div class="... rounded-2xl ... bg-surface-container-low ...">,
    // pas un <li> -- filtrer par ces fragments de classe évite d'attraper un
    // conteneur ancêtre plus large (qui "contient" aussi le texte).
    const row = page
      .locator('div[class*="rounded-2xl"][class*="bg-surface-container-low"]')
      .filter({ hasText: "QA Admin Flow" })
      .first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await row.scrollIntoViewIfNeeded();
    await humanPause(page, 400);

    const validerBtn = row.getByRole("button", { name: "Valider" });
    await expect(validerBtn).toBeVisible();
    await validerBtn.click();
    await humanPause(page, 1500);

    await expect(row.getByText("Validée")).toBeVisible({ timeout: 10_000 });

    test.info().annotations.push({ type: "qa-test-account", description: testEmail });
    expect(consoleErrors, "Erreurs console pendant le flux d'approbation admin").toEqual([]);
  });

  test("flux complet : créer un message de contact de test, puis changer son statut en admin", async ({
    page,
    consoleErrors,
  }) => {
    const testEmail = await submitFreshContact(page, "qaadminmsg");

    await login(page, PERSONAS.admin.email, PERSONAS.admin.password);
    await humanPause(page, 1500);

    await page.goto("/admin?tab=contacts");
    await humanPause(page, 800);

    // Messages = <li> (role=listitem) -- scope precis, evite les boutons du
    // filtre "Statut" qui portent aussi le texte "Nouveau".
    const row = page.getByRole("listitem").filter({ hasText: "QA Admin Contact" }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await row.scrollIntoViewIfNeeded();
    await humanPause(page, 400);

    await expect(row.getByText("Nouveau", { exact: true })).toBeVisible();
    const changeBtn = row.getByRole("button", { name: /changer le statut/i });
    await expect(changeBtn).toBeVisible();
    await changeBtn.click();
    await humanPause(page, 1200);

    await expect(row.getByText("Traité", { exact: true })).toBeVisible({ timeout: 10_000 });

    test.info().annotations.push({ type: "qa-test-contact", description: testEmail });
    expect(consoleErrors, "Erreurs console pendant le changement de statut contact").toEqual([]);

    await logout(page);
  });

  test("dashboard : vue d'ensemble se charge sans erreur, compteurs cohérents", async ({
    page,
    consoleErrors,
  }) => {
    await login(page, PERSONAS.admin.email, PERSONAS.admin.password);
    await humanPause(page, 1500);
    await page.goto("/admin?tab=dashboard");
    await humanPause(page, 800);

    await expect(page.getByRole("heading", { name: /tableau de bord/i })).toBeVisible();
    await expect(page.getByText(/demandes en attente/i).first()).toBeVisible();
    await expect(page.getByText(/nouveaux messages/i).first()).toBeVisible();

    expect(consoleErrors, "Erreurs console sur le dashboard admin").toEqual([]);
    await logout(page);
  });
});
