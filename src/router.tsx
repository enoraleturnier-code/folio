import { createBrowserRouter } from "react-router-dom";

import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProfilePage, profileLoader } from "@/pages/ProfilePage";
import { RootLayout } from "@/pages/RootLayout";
import { RouteError } from "@/pages/RouteError";
import { SlugLayout } from "@/pages/SlugLayout";

// Seule ProfilePage (page d'accueil publique, / et /:slug) reste importée
// statiquement -- c'est la page qu'un visiteur charge en premier, elle doit
// être prête sans aller-retour réseau supplémentaire. Toutes les autres
// routes passent par `lazy` (React Router 7) pour que le bundle initial
// n'embarque ni AdminPage (~2600 lignes : dashboard, éditeur, veille,
// react-markdown/remark, date-fns+locale) ni les pages secondaires
// (auth, compte, légal, 404) -- chacune devient son propre chunk chargé à
// la demande, au clic sur le lien correspondant.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="min-h-screen bg-background" />,
    children: [
      {
        element: <SlugLayout />,
        children: [
          // "/" est directement le profil de Léa -- plus de redirect() vers
          // /:slug (économise un aller-retour réseau complet au premier
          // chargement). "/:slug" reste valide en parallèle pour les liens
          // déjà partagés/indexés.
          { index: true, loader: profileLoader, element: <ProfilePage /> },
          {
            path: ":slug",
            children: [
              { index: true, loader: profileLoader, element: <ProfilePage /> },
              {
                path: "projects",
                lazy: async () => {
                  const { CataloguePage, catalogueLoader } = await import("@/pages/CataloguePage");
                  return { Component: CataloguePage, loader: catalogueLoader };
                },
              },
              {
                path: "projects/:id",
                lazy: async () => {
                  const { ProjectDetailPage, projectDetailLoader } = await import(
                    "@/pages/ProjectDetailPage"
                  );
                  return { Component: ProjectDetailPage, loader: projectDetailLoader };
                },
              },
            ],
          },
        ],
      },
      {
        path: "/admin",
        lazy: async () => {
          const { AdminPage } = await import("@/pages/AdminPage");
          return { Component: AdminPage };
        },
      },
      {
        path: "/auth",
        lazy: async () => {
          const { AuthPage } = await import("@/pages/AuthPage");
          return { Component: AuthPage };
        },
      },
      {
        path: "/account",
        lazy: async () => {
          const { AccountPage } = await import("@/pages/AccountPage");
          return { Component: AccountPage };
        },
      },
      {
        path: "/politique-de-confidentialite",
        lazy: async () => {
          const { PrivacyPolicyPage } = await import("@/pages/PrivacyPolicyPage");
          return { Component: PrivacyPolicyPage };
        },
      },
      {
        path: "/mentions-legales",
        lazy: async () => {
          const { LegalNoticePage } = await import("@/pages/LegalNoticePage");
          return { Component: LegalNoticePage };
        },
      },
      {
        path: "/aide",
        lazy: async () => {
          const { HelpPage } = await import("@/pages/HelpPage");
          return { Component: HelpPage };
        },
      },
      // Import statique (pas de gain de code-splitting possible : RouteError.tsx
      // importe déjà NotFoundPage statiquement pour l'errorElement racine).
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
