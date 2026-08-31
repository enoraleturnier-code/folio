import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { AuroraBackground } from "@/components/AuroraBackground";
import { cn, FOCUSABLE_SELECTOR } from "@/lib/utils";

interface SlideSheetProps {
  open: boolean;
  onClose: () => void;
  /** "bottom" = feuille pleine page (theme/compte) ; "left" = tiroir 70% (burger) ;
   * "right" = tiroir 70% (filtres catalogue/admin). */
  from: "bottom" | "left" | "right";
  ariaLabel: string;
  /** Ferme au clic sur l'overlay -- seuls les tiroirs latéraux (burger, filtres)
   * l'utilisent, les feuilles pleine page n'ont pas de zone visible "à l'extérieur". */
  closeOnBackdropClick?: boolean;
  /** Classe additionnelle sur le conteneur racine (ex. `md:hidden` pour un
   * tiroir mobile-only doublé d'une variante desktop distincte). */
  className?: string;
  /** Override de la largeur du tiroir "left" (défaut `w-[70%]`, pensé pour
   * mobile) -- utile quand le même SlideSheet sert aussi en desktop, où 70%
   * de la largeur d'écran est disproportionné (ex. filtre catalogue). */
  widthClassName?: string;
  /** Override de la classe de durée (défaut `duration-[var(--duration-drawer)]`,
   * 250ms) -- utile pour synchroniser l'animation avec un déclencheur externe
   * qui a son propre timing (ex. bouton hamburger→croix, 300ms). Doit rester
   * cohérent avec `durationMs` (valeur JS, pas lisible depuis la classe CSS). */
  durationClassName?: string;
  /** Doit correspondre en ms à `durationClassName` -- pilote le délai avant
   * démontage complet (`setMounted(false)`) après la fermeture, pour ne pas
   * couper l'animation de sortie en cours de route. */
  durationMs?: number;
  /** Désactive le montage d'`<AuroraBackground variant="modal" />` (défaut
   * true) -- utile quand le tiroir doit rester sur un fond neutre uni sans
   * aucun halo décoratif (ex. menu burger plein écran). */
  showAuroraBackground?: boolean;
  /** Classe additionnelle sur le PANNEAU (pas le conteneur racine) -- fusionnée
   * via `cn()`/tailwind-merge, donc tout `bg-*`/`border-*` passé ici remplace
   * les défauts (`bg-surface-container-lowest` + `border-white/15`). Utile pour
   * un style spécifique à une instance (ex. fond glass façon `.glass-card`). */
  panelClassName?: string;
  /** Anime l'entrée avec un léger effet "rebond" (scale 95%→100% + easing
   * overshoot `cubic-bezier(0.34,1.56,0.64,1)`) au lieu du `ease-out` linéaire
   * par défaut -- pensé pour un panneau qui doit sembler se détacher du fond
   * plutôt que glisser platement. */
  bouncy?: boolean;
  /** Override du z-index racine (défaut `z-[1000]`) -- utile pour qu'un élément
   * fixe d'une autre couche (ex. le header, `z-50`) reste visible PAR-DESSUS ce
   * panneau plutôt que d'être recouvert par l'overlay (ex. menu burger : le
   * bouton hamburger→croix doit rester cliquable au même endroit). */
  zIndexClassName?: string;
  children: ReactNode;
}

/** Panneau plein écran (bas) ou tiroir (gauche) avec animation d'entrée, fond
 * AuroraBackground + overlay, Échap, et blocage du scroll -- monte une seule fois
 * par pile, réutilisé par les feuilles thème/compte et le menu burger. */
export function SlideSheet({
  open,
  onClose,
  from,
  ariaLabel,
  closeOnBackdropClick = false,
  className,
  widthClassName,
  durationClassName = "duration-[var(--duration-drawer)]",
  durationMs = 250,
  showAuroraBackground = true,
  panelClassName,
  bouncy = false,
  zIndexClassName = "z-[1000]",
  children,
}: SlideSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), durationMs);
    return () => clearTimeout(t);
  }, [open, durationMs]);

  // Focus initial dans le tiroir + restitution au declencheur a la fermeture --
  // meme pattern que AccessRequestModal.tsx. Cle sur `mounted` (pas `open`) :
  // le rendu du panneau (et donc panelRef) n'apparait qu'au cycle de rendu
  // declenche par setMounted(true) ci-dessus, un rendu apres le passage de `open`.
  useEffect(() => {
    if (!mounted) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    return () => {
      triggerRef.current?.focus();
    };
  }, [mounted]);

  // Echap + piege a focus -- meme pattern que AccessRequestModal.tsx (seul
  // autre vrai dialog modal du site) : Tab ne doit jamais faire sortir le
  // focus vers le contenu de page masque derriere l'overlay.
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  const positionCls =
    from === "bottom"
      ? "inset-x-0 bottom-0 h-full rounded-t-2xl"
      : `inset-y-0 ${from === "right" ? "right-0" : "left-0"} h-full ${widthClassName ?? "w-[70%]"}`;

  const transformCls =
    (from === "bottom"
      ? visible
        ? "translate-y-0"
        : "translate-y-full"
      : visible
        ? "translate-x-0"
        : from === "right"
          ? "translate-x-full"
          : "-translate-x-full") + (bouncy ? (visible ? " scale-100" : " scale-95") : "");

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={cn("fixed inset-0", zIndexClassName, className)}
    >
      <div
        className={
          "absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity ease-out " +
          durationClassName +
          " " +
          (visible ? "opacity-100" : "opacity-0")
        }
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn(
          "absolute flex flex-col overflow-hidden shadow-2xl shadow-black/40 transition-transform",
          bouncy ? "ease-[cubic-bezier(0.34,1.56,0.64,1)]" : "ease-out",
          durationClassName,
          positionCls,
          transformCls,
          "bg-surface-container-lowest",
          from === "left" && "border-r border-white/15",
          from === "right" && "border-l border-white/15",
          panelClassName,
        )}
      >
        {showAuroraBackground && <AuroraBackground variant="modal" />}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
