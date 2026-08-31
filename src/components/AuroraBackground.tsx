import { useEffect, useState } from "react";

import SoftAurora from "@/components/SoftAurora";
import { cn } from "@/lib/utils";

export type AuroraVariant = "profile" | "catalogue" | "modal";

interface AuroraBackgroundProps {
  /** "modal" (SlideSheet, AccessRequestModal, AuthPage, AdminPage) rend le
   * même fond que les cartes (`.glass-card`, cf. styles.css) -- aucune
   * couleur aurora, pas de canvas WebGL derrière une modale (28/08, demande
   * explicite, neutralisé le même jour après un essai coloré intermédiaire).
   * "profile"/"catalogue" gardent l'animation Soft Aurora. */
  variant?: AuroraVariant;
}

/** Fond décoratif "Soft Aurora" (WebGL via `ogl`, cf. SoftAurora.tsx --
 * installé depuis reactbits.dev, Background Studio) : remplace l'ancien fond
 * CSS (taches circulaires floutées) sur toute l'app. Les 4 couleurs sont
 * celles du design system (aurora-teal/purple/cyan/indigo, cf. DESIGN.md).
 *
 * Activé sur mobile depuis le 28/08 (demande explicite, à surveiller) --
 * l'ancien fond CSS avait causé des gels/écrans noirs documentés sur mobile
 * (23/07, empilement de calques `filter: blur()`), mais un canvas WebGL
 * unique est architecturalement différent (pas de compositing CSS coûteux) ;
 * repasser `enabled` sous une media query `(max-width: 767px)` si des soucis
 * de perf remontent. `prefers-reduced-motion` reste respecté (accessibilité,
 * indépendant du sujet perf). */
export function AuroraBackground({ variant = "profile" }: AuroraBackgroundProps) {
  const [enabled, setEnabled] = useState(false);
  const isModal = variant === "modal";

  useEffect(() => {
    if (isModal) return;
    const mqlMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mqlMotion.matches);
    update();
    mqlMotion.addEventListener("change", update);
    return () => {
      mqlMotion.removeEventListener("change", update);
    };
  }, [isModal]);

  if (isModal) {
    return <div className="aurora-bg aurora-bg--modal" aria-hidden="true" />;
  }

  if (!enabled) return null;

  return (
    <div
      className={cn("aurora-bg", variant !== "profile" && `aurora-bg--${variant}`)}
      aria-hidden="true"
    >
      <SoftAurora
        speed={0.5}
        scale={0.7}
        brightness={variant === "catalogue" ? 0.25 : 0.45}
        color1="#2DD4BF"
        color2="#7C3AED"
        color3="#06B6D4"
        color4="#818CF8"
        noiseAmplitude={3.5}
        bandHeight={0.7}
        octaveDecay={0.42}
        layerOffset={0.5}
        mouseInfluence={0.3}
      />
    </div>
  );
}
