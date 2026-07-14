import { Check, Contrast, Moon, Sun, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { IconTooltip } from "@/components/IconTooltip";

type ThemeMode = "dark" | "light" | "system";

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

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem("folio-theme");
    if (stored === "light") return "light";
    if (stored === "dark") return "dark";
    return "system";
  } catch {
    return "system";
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: ThemeMode) => {
    setMode(next);
    try {
      localStorage.setItem("folio-theme", next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    setOpen(false);
  };

  const options: { key: ThemeMode; icon: LucideIcon; label: string }[] = [
    { key: "dark", icon: Moon, label: "Sombre" },
    { key: "light", icon: Sun, label: "Clair" },
    { key: "system", icon: Contrast, label: "Auto" },
  ];

  const TriggerIcon = mode === "light" ? Sun : mode === "system" ? Contrast : Moon;

  return (
    <div className="relative" ref={ref}>
      <IconTooltip label="Choisir le thème d'affichage">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Choisir le thème d'affichage"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface transition-all hover:bg-primary-container/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <TriggerIcon aria-hidden="true" size={24} />
        </button>
      </IconTooltip>

      {open && (
        <div className="absolute right-0 z-[80] mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-2xl">
          <div className="flex flex-col py-1">
            {options.map((opt) => {
              const active = mode === opt.key;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => choose(opt.key)}
                  className={
                    "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset " +
                    (active ? "text-primary" : "text-on-surface-variant")
                  }
                >
                  <OptIcon aria-hidden="true" size={18} />
                  <span className="flex-1 text-left">{opt.label}</span>
                  {active && <Check aria-hidden="true" className="text-primary" size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
