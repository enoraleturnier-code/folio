import { test, expect, SLUG, humanPause, humanScroll } from "./fixtures";

test.describe("Catalogue public (anon)", () => {
  test("page profil : contenu de base et navigation vers le catalogue", async ({ page, consoleErrors }) => {
    await page.goto(`/${SLUG}`);
    await humanPause(page, 600);
    await expect(page.getByRole("heading", { name: "Léa Martin" })).toBeVisible();
    await humanScroll(page, 2);
    const voirProjets = page.getByRole("link", { name: /voir les projets/i });
    await expect(voirProjets).toBeVisible();
    await voirProjets.hover();
    await humanPause(page, 300);
    await voirProjets.click();
    await expect(page).toHaveURL(new RegExp(`/${SLUG}/projects$`));
    expect(consoleErrors, `Erreurs console sur /${SLUG} ou /${SLUG}/projects`).toEqual([]);
  });

  test("catalogue : filtres type + secteur/outils/mots-clés", async ({ page, consoleErrors }) => {
    await page.goto(`/${SLUG}/projects`);
    await humanPause(page, 500);
    await expect(page.getByRole("heading", { name: "Catalogue de projets" })).toBeVisible();

    const countText = page.getByText(/\d+ PROJETS?/i);
    await expect(countText).toBeVisible();
    const initialCount = await countText.textContent();

    // Filtre type "3D"
    const type3D = page.getByRole("button", { name: "3D", exact: true });
    if (await type3D.isVisible().catch(() => false)) {
      await type3D.click();
      await humanPause(page, 400);
      const filteredCount = await countText.textContent();
      expect(filteredCount).not.toBe(initialCount);

      // Reclique pour désactiver -- doit revenir au compte initial
      await type3D.click();
      await humanPause(page, 400);
      await expect(countText).toHaveText(initialCount ?? "");
    }

    // Panneau secondaire (Secteur / Outils / Mots-clés)
    const filterToggle = page.getByRole("button", { name: "Filtrer" });
    await expect(filterToggle).toBeVisible();
    await filterToggle.click();
    await humanPause(page, 400);
    await expect(page.getByText("Secteur", { exact: true })).toBeVisible();
    await expect(page.getByText("Outils", { exact: true })).toBeVisible();
    await expect(page.getByText("Mots-clés", { exact: true })).toBeVisible();

    expect(consoleErrors, "Erreurs console pendant l'usage des filtres").toEqual([]);
  });

  test("carte teaser confidentielle : infos visibles sans être connecté, badge + CTA accès", async ({
    page,
    consoleErrors,
  }) => {
    await page.goto(`/${SLUG}/projects`);
    await humanPause(page, 500);

    const confidentialBadge = page.getByText("CONFIDENTIEL", { exact: true }).first();
    await expect(confidentialBadge).toBeVisible();

    const demanderAcces = page.getByRole("button", { name: /demander l'accès au projet/i }).first();
    await expect(demanderAcces).toBeVisible();
    await humanScroll(page, 1);

    expect(consoleErrors).toEqual([]);
  });

  test("clic sur un projet public ouvre bien la fiche détail", async ({ page, consoleErrors }) => {
    await page.goto(`/${SLUG}/projects`);
    await humanPause(page, 500);

    // Un lien de projet a un href /:slug/projects/:id (public, pas de bouton "Demander l'accès" à côté)
    const projectLinks = page.locator(`a[href^="/${SLUG}/projects/"]`);
    const count = await projectLinks.count();
    expect(count, "Au moins un projet cliquable attendu dans le catalogue").toBeGreaterThan(0);

    await projectLinks.first().hover();
    await humanPause(page, 300);
    await projectLinks.first().click();
    await page.waitForLoadState("networkidle");
    await humanPause(page, 400);

    // Pas de 404 / crash -- une fiche projet doit rendre un minimum de contenu
    await expect(page.locator("body")).not.toContainText("404");
    expect(consoleErrors, "Erreurs console sur la fiche projet").toEqual([]);
  });
});
