import { Link } from "react-router-dom";

import { designer } from "@/data/designer";

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-white/5 bg-background/60 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xl font-medium text-on-surface">
              Folio<span className="text-primary">+</span>
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              © 2026 Folio+. Midnight gallery edition.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-on-surface-variant">
            <a href={designer.linkedin} className="hover:text-primary transition-colors">
              LinkedIn
            </a>
            <a href={designer.twitter} className="hover:text-primary transition-colors">
              Twitter
            </a>
            <a href={designer.website} className="hover:text-primary transition-colors">
              Site
            </a>
            <a href={`mailto:${designer.email}`} className="hover:text-primary transition-colors">
              {designer.email}
            </a>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/5 pt-6 text-xs text-on-surface-variant/70">
          <Link to="/politique-de-confidentialite" className="hover:text-primary transition-colors">
            Politique de confidentialité
          </Link>
          <Link to="/mentions-legales" className="hover:text-primary transition-colors">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
