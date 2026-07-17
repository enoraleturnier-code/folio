import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "system";

function applyTheme(mode: ThemeMode) {
  const c = document.documentElement.classList;
  c.remove("dark", "light");
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    c.add(prefersDark ? "dark" : "light");
  } else {
    c.add(mode);
  }
}

// TEMPORAIRE (C.1) : "Clair" et "Système" restent desactives quel que soit le
// mode stocke ou le matchMedia systeme, pour rester coherent avec THEME_INIT
// (index.html). Ne touche pas a applyTheme()/choose() : la logique light reste
// en place, seule l'activation est coupee -- a retirer ici avec la reactivation
// complete.
function readStoredMode(): ThemeMode {
  return "dark";
}

/** Etat du theme partage entre ThemeToggle (desktop) et les feuilles mobiles
 * (theme + compte) -- une seule source de verite pour eviter toute divergence. */
export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [mode]);

  const choose = (next: ThemeMode) => {
    setMode(next);
    try {
      localStorage.setItem("folio-theme", next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
  };

  return { mode, choose };
}
