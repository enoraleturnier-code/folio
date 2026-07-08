import { useEffect } from "react";
import { isRouteErrorResponse, useRevalidator, useRouteError } from "react-router-dom";

import { reportLovableError } from "@/lib/lovable-error-reporting";
import { NotFoundPage } from "./NotFoundPage";

export function RouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (is404) return;
    console.error(error);
    reportLovableError(error, { boundary: "root_error_element" });
  }, [error, is404]);

  if (is404) return <NotFoundPage />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium text-on-surface">Cette page n'a pas pu se charger</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Une erreur s'est produite. Rafraîchissez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => revalidator.revalidate()}
            className="inline-flex items-center justify-center rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-on-primary hover:opacity-90"
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
