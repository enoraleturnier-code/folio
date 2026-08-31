import { NavLink } from "react-router-dom";

import { SlideSheet } from "@/components/SlideSheet";
import { designer } from "@/data/designer";
import { cn } from "@/lib/utils";

/** Tiroir plein écran -- profil/projets du visiteur, pages publiques
 * uniquement. Entre par la droite (`from="right"`), fond glass (même style que
 * `.glass-card`, cf. DESIGN.md) et entrée "bouncy" (`bouncy`, scale 95→100 +
 * easing overshoot) pour que le tiroir semble se détacher du fond au lieu de
 * glisser platement. Durée 300ms (vs 250ms par défaut) -- reste synchronisée
 * avec l'animation du bouton hamburger→croix, qui a son propre
 * `transition: 0.3s` fixe dans `styles.css`.
 *
 * Pas de bouton de fermeture dédié dans le tiroir : le seul contrôle
 * ouvrir/fermer est le bouton hamburger→croix du header (`Header.tsx`), qui
 * reste visible ET cliquable au même endroit pendant que le tiroir est ouvert
 * (`zIndexClassName="z-40"`, sous le header `z-50` -- sans ça le tiroir, en
 * `z-[1000]` par défaut, recouvrirait le header). Fermeture alternative :
 * Échap ou clic sur l'overlay (`closeOnBackdropClick`).
 *
 * `BurgerLink` reprend l'état actif de `VisitorLink` (nav desktop, `Header.tsx`) :
 * `bg-primary/15 font-bold text-primary` au lieu du simple `text-primary` --
 * même traitement des deux côtés du breakpoint `md` (28/08, retouche). */
export function BurgerMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SlideSheet
      open={open}
      onClose={onClose}
      from="right"
      ariaLabel="Menu"
      closeOnBackdropClick
      widthClassName="w-full"
      durationClassName="duration-300"
      durationMs={300}
      showAuroraBackground={false}
      bouncy
      zIndexClassName="z-40"
      panelClassName="bg-[color-mix(in_oklab,var(--surface-container-low)_70%,transparent)] backdrop-blur-md"
    >
      {/* Espace réservé sous le header (fixed, ~76px sur mobile) -- le tiroir
       * démarre sous le bouton hamburger→croix, jamais derrière. */}
      <div className="h-20 shrink-0" aria-hidden="true" />

      <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6 pb-20 text-center">
        <p className="font-display-accent text-4xl text-primary-container md:text-5xl">
          {designer.fullName}
        </p>
        <nav className="flex flex-col items-center gap-6">
          <BurgerLink to={`/${designer.slug}`} label="Profil" onClose={onClose} end />
          <BurgerLink to={`/${designer.slug}/projects`} label="Projets" onClose={onClose} />
        </nav>
      </div>
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
        cn(
          "rounded-xl px-6 py-2 text-4xl transition-colors duration-[var(--duration-fast)] ease-signature",
          isActive
            ? "bg-primary/15 font-bold text-primary"
            : "font-medium text-on-surface-variant hover:text-primary",
        )
      }
    >
      {label}
    </NavLink>
  );
}
