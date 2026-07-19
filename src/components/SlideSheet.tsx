import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { AuroraBackground } from "@/components/AuroraBackground";

interface SlideSheetProps {
  open: boolean;
  onClose: () => void;
  /** "bottom" = feuille pleine page (theme/compte) ; "left" = tiroir 70% (burger). */
  from: "bottom" | "left";
  ariaLabel: string;
  /** Ferme au clic sur l'overlay -- seul le tiroir gauche (burger) l'utilise,
   * les feuilles pleine page n'ont pas de zone visible "à l'extérieur". */
  closeOnBackdropClick?: boolean;
  /** Classe additionnelle sur le conteneur racine (ex. `md:hidden` pour un
   * tiroir mobile-only doublé d'une variante desktop distincte). */
  className?: string;
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
  children,
}: SlideSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

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

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
    from === "bottom" ? "inset-x-0 bottom-0 h-full rounded-t-2xl" : "inset-y-0 left-0 h-full w-[70%]";

  const transformCls =
    from === "bottom"
      ? visible
        ? "translate-y-0"
        : "translate-y-full"
      : visible
        ? "translate-x-0"
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
          "absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-[250ms] " +
          (visible ? "opacity-100" : "opacity-0")
        }
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        className={
          "absolute flex flex-col overflow-hidden bg-surface-container-lowest shadow-2xl shadow-black/40 transition-transform duration-[250ms] ease-out " +
          positionCls +
          " " +
          transformCls +
          (from === "left" ? " border-r border-white/15" : "")
        }
      >
        <AuroraBackground variant="modal" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
