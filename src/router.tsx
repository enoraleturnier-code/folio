import { createBrowserRouter, redirect } from "react-router-dom";

import { designer } from "@/data/designer";

import { AccountPage } from "@/pages/AccountPage";
import { AdminPage } from "@/pages/AdminPage";
import { AuthPage } from "@/pages/AuthPage";
import { CataloguePage, catalogueLoader } from "@/pages/CataloguePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProfilePage, profileLoader } from "@/pages/ProfilePage";
import { ProjectDetailPage, projectDetailLoader } from "@/pages/ProjectDetailPage";
import { RootLayout } from "@/pages/RootLayout";
import { RouteError } from "@/pages/RouteError";
import { SlugLayout } from "@/pages/SlugLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="min-h-screen bg-background" />,
    children: [
      {
        path: "/",
        loader: () => redirect(`/${designer.slug}`),
        element: <></>,
      },
      {
        path: "/:slug",
        element: <SlugLayout />,
        children: [
          { index: true, loader: profileLoader, element: <ProfilePage /> },
          { path: "projects", loader: catalogueLoader, element: <CataloguePage /> },
          { path: "projects/:id", loader: projectDetailLoader, element: <ProjectDetailPage /> },
        ],
      },
      { path: "/admin", element: <AdminPage /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/account", element: <AccountPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
