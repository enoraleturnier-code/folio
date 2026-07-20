import { CircleHelp } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

const footerLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn("transition-colors hover:text-primary hover:font-bold", isActive && "font-bold");

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
            <NavLink to="/politique-de-confidentialite" className={footerLinkClass}>
              Politique de confidentialité
            </NavLink>
            <NavLink to="/mentions-legales" className={footerLinkClass}>
              Mentions légales
            </NavLink>
            <NavLink
              to="/aide"
              className={({ isActive }) => cn("inline-flex items-center gap-1.5", footerLinkClass({ isActive }))}
            >
              <CircleHelp aria-hidden="true" size={16} />
              Aide
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
