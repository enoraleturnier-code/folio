import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { SlideSheet } from "@/components/SlideSheet";
import { designer } from "@/data/designer";

/** Tiroir gauche 70% -- profil/projets du visiteur, pages publiques uniquement. */
export function BurgerMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideSheet open={open} onClose={onClose} from="left" ariaLabel="Menu" closeOnBackdropClick>
      <div className="flex items-center justify-between px-6 py-6">
        <span className="text-2xl font-medium tracking-tight text-on-surface">
          Folio<span className="text-primary">+</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X aria-hidden="true" size={22} />
        </button>
      </div>
      <div className="border-t border-outline-variant" />
      <div className="px-6 py-4">
        <p className="text-lg font-semibold text-on-surface">{designer.fullName}</p>
      </div>
      <nav className="flex flex-col gap-2 px-4 py-2">
        <BurgerLink to={`/${designer.slug}`} label="Profil" onClose={onClose} end />
        <BurgerLink to={`/${designer.slug}/projects`} label="Projets" onClose={onClose} />
      </nav>
    </SlideSheet>
  );
}

function BurgerLink({
  to,
  label,
  onClose,
  end,
}: {
  to: string;
  label: string;
  onClose: () => void;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        "w-full rounded-xl px-4 py-3 text-base transition-colors " +
        (isActive
          ? "bg-primary/15 font-bold text-primary"
          : "font-medium text-on-surface-variant hover:bg-white/5 hover:text-primary")
      }
    >
      {label}
    </NavLink>
  );
}
