import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">404</p>
        <h1 className="mt-4 text-4xl font-medium text-on-surface">
          Page <span className="font-display-accent italic text-primary">introuvable</span>
        </h1>
        <p className="mt-4 text-sm text-on-surface-variant">
          Ce lien n'existe pas ou a été retiré du portfolio.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary-container px-6 py-3 text-sm font-bold text-on-primary transition-colors hover:opacity-90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
