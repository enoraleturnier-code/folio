import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const THEME_INIT = `(function(){try{var t=localStorage.getItem('folio-theme');var c=document.documentElement.classList;c.remove('light','dark');var d;if(t==='dark'){d=true;}else if(t==='light'){d=false;}else{d=window.matchMedia('(prefers-color-scheme: dark)').matches;}c.add(d?'dark':'light');}catch(e){document.documentElement.classList.add('dark');}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">404</p>
        <h1 className="mt-4 text-4xl font-medium text-on-surface">
          Page{" "}
          <span className="font-display-accent italic text-primary">introuvable</span>
        </h1>
        <p className="mt-4 text-sm text-on-surface-variant">
          Ce lien n'existe pas ou a été retiré du portfolio.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-colors hover:opacity-90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium text-on-surface">Cette page n'a pas pu se charger</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Une erreur s'est produite. Rafraîchissez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-on-surface hover:border-primary"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Folio+ — Portfolios confidentiels pour designers freelance" },
      {
        name: "description",
        content:
          "Folio+ est une plateforme de portfolios à accès contrôlé pour designers freelance. Partagez vos projets confidentiels avec les personnes que vous choisissez.",
      },
      { name: "author", content: "Folio+" },
      { property: "og:title", content: "Folio+ — Portfolios confidentiels pour designers freelance" },
      {
        property: "og:description",
        content:
          "Partagez vos projets confidentiels avec les personnes que vous choisissez. Une galerie de nuit pour un travail précieux.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Cormorant+Garamond:ital,wght@1,500&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
      },
    ],
    scripts: [{ children: THEME_INIT }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
