import { CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/5 bg-background/60 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-medium text-on-surface">
              Folio<span className="text-primary">+</span>
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">
              © 2026 Folio+. Midnight gallery edition.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-4 text-center text-sm text-on-surface-variant md:w-auto md:flex-row md:flex-wrap md:gap-6 md:text-left">
            <Link to="/politique-de-confidentialite" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/mentions-legales" className="hover:text-primary transition-colors">
              Mentions légales
            </Link>
            <Link
              to="/aide"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <CircleHelp aria-hidden="true" size={16} />
              Aide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
