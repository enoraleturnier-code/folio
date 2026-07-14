import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { IconTooltip } from "@/components/IconTooltip";

/** Bouton flottant "retour en haut" -- monté une seule fois dans RootLayout.tsx pour apparaître sur toutes les pages. */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <IconTooltip label="Retour en haut">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
        className="fixed right-5 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 md:right-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ChevronUp aria-hidden="true" size={22} />
      </button>
    </IconTooltip>
  );
}
