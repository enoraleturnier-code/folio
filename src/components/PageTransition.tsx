import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

/** Fondu d'entree rejoue a chaque changement de route -- meme idiome que
 * SlideSheet (mount puis requestAnimationFrame avant de passer visible, pour
 * garantir que le navigateur peigne l'etat initial avant la transition).
 * Fondu d'entree uniquement (pas de sortie) : suffisant pour rompre le cut
 * instantane entre pages sans complexite d'unmount differe. Neutralise
 * automatiquement par la regle globale prefers-reduced-motion de styles.css. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div
      className={
        "transition-opacity duration-[var(--duration-standard)] ease-signature " +
        (visible ? "opacity-100" : "opacity-0")
      }
    >
      {children}
    </div>
  );
}
