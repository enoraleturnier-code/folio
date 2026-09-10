import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { IconTooltip } from "@/components/IconTooltip";
import { FOCUS_RING, prefersReducedMotion } from "@/lib/utils";

/** Bouton flottant "retour en haut" -- monté une seule fois dans RootLayout.tsx pour apparaître sur toutes les pages. */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <IconTooltip label="Retour en haut">
      <button
        type="button"
        onClick={() =>
          window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
        }
        aria-label="Retour en haut"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        className={
          "glass-card fixed bottom-6 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-on-surface shadow-xl shadow-black/40 transition-all duration-[var(--duration-standard)] ease-signature hover:scale-105 hover:border-primary hover:text-primary active:scale-95 md:bottom-8 md:right-16 " +
          FOCUS_RING +
          " " +
          (visible ? "opacity-100" : "pointer-events-none opacity-0")
        }
      >
        <ChevronUp aria-hidden="true" size={22} />
      </button>
    </IconTooltip>
  );
}
