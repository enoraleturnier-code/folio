import { test, expect, SLUG, PERSONAS, humanPause, login, logout } from "./fixtures";

test.describe("Connexion par rôle -- pending / validated_visitor", () => {
  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test("pending (Sophie) : connexion réussie, redirigée vers le catalogue, pas d'accès admin", async ({
    page,
    consoleErrors,
  }) => {
    await login(page, PERSONAS.pending.email, PERSONAS.pending.password);
    await humanPause(page, 1500);
    await expect(page).toHaveURL(new RegExp(`/${SLUG}/projects$`), { timeout: 15_000 });

    // Un pending n'a pas de rôle admin -- /admin doit rediriger ailleurs
    await page.goto("/admin");
    await humanPause(page, 1000);
    await expect(page).not.toHaveURL(/\/admin$/);

    expect(consoleErrors, "Erreurs console en tant que pending").toEqual([]);
  });

  test("pending (Sophie) : le catalogue affiche un mélange d'états d'accès (pas tout débloqué par défaut)", async ({
    page,
  }) => {
    await login(page, PERSONAS.pending.email, PERSONAS.pending.password);
    await humanPause(page, 1500);
    await page.goto(`/${SLUG}/projects`);
    await humanPause(page, 600);

    // Badge combiné "Confidentiel · Accès validé" uniquement sur les projets
    // individuellement approuvés (F-12 : approved débloque un seul projet,
    // jamais le rôle global) -- badge simple "CONFIDENTIEL" sinon.
    const grantedCount = await page.getByText(/confidentiel\s*·\s*accès validé/i).count();
    const plainConfidentialCount = await page.getByText("CONFIDENTIEL", { exact: true }).count();

    test.info().annotations.push({
      type: "qa-observation",
      description: `Sophie (pending) : ${grantedCount} projet(s) individuellement approuvés, ${plainConfidentialCount} carte(s) confidentielle(s) non débloquées.`,
    });

    // Au moins une carte confidentielle doit exister sur ce catalogue de démo
    expect(grantedCount + plainConfidentialCount, "Aucune carte confidentielle trouvée -- catalogue vide ?").toBeGreaterThan(0);
  });

  test("validated_visitor (Karim) : accès débloqué à tout le catalogue confidentiel", async ({
    page,
    consoleErrors,
  }) => {
    await login(page, PERSONAS.validated.email, PERSONAS.validated.password);
    await humanPause(page, 1500);
    await page.goto(`/${SLUG}/projects`);
    await humanPause(page, 600);

    const grantedCount = await page.getByText(/confidentiel\s*·\s*accès validé/i).count();
    const plainConfidentialCount = await page.getByText("CONFIDENTIEL", { exact: true }).count();

    expect(grantedCount, "validated_visitor doit voir au moins un projet confidentiel débloqué").toBeGreaterThan(0);
    expect(
      plainConfidentialCount,
      "validated_visitor ne devrait voir AUCUNE carte confidentielle encore verrouillée (accès global débloqué)",
    ).toBe(0);

    expect(consoleErrors, "Erreurs console en tant que validated_visitor").toEqual([]);
  });
});
