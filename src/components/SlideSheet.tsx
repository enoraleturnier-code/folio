import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { AuroraBackground } from "@/components/AuroraBackground";
import { FOCUSABLE_SELECTOR } from "@/lib/utils";

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
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open]);

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
    from === "bottom"
      ? visible
        ? "translate-y-0"
        : "translate-y-full"
      : visible
        ? "translate-x-0"
        : from === "right"
          ? "translate-x-full"
          : "-translate-x-full";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={"fixed inset-0 z-[1000]" + (className ? " " + className : "")}
    >
      <div
        className={
          "absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-[var(--duration-drawer)] " +
          (visible ? "opacity-100" : "opacity-0")
        }
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={
          "absolute flex flex-col overflow-hidden bg-surface-container-lowest shadow-2xl shadow-black/40 transition-transform duration-[var(--duration-drawer)] ease-out " +
          positionCls +
          " " +
          transformCls +
          (from === "left"
            ? " border-r border-white/15"
            : from === "right"
              ? " border-l border-white/15"
              : "")
        }
      >
        <AuroraBackground variant="modal" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
