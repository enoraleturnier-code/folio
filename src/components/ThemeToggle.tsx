import { useEffect, useRef, useState } from "react";

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

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("folio-theme") : null;
    const initial: ThemeMode =
      stored === "dark" || stored === "light" ? stored : "system";
    setMode(initial);
  }, []);

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
      if (next === "system") localStorage.removeItem("folio-theme");
      else localStorage.setItem("folio-theme", next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
    setOpen(false);
  };

  const options: { key: ThemeMode; icon: string; label: string }[] = [
    { key: "dark", icon: "dark_mode", label: "Sombre" },
    { key: "light", icon: "light_mode", label: "Clair" },
    { key: "system", icon: "contrast", label: "Auto" },
  ];

  const triggerIcon =
    mode === "light" ? "light_mode" : mode === "system" ? "contrast" : "dark_mode";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Choisir le thème d'affichage"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-on-surface transition-all hover:bg-primary/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          {triggerIcon}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-[80] mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-2xl">
          <div className="flex flex-col py-1">
            {options.map((opt) => {
              const active = mode === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => choose(opt.key)}
                  className={
                    "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-on-surface " +
                    (active ? "text-primary" : "text-on-surface-variant")
                  }
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    {opt.icon}
                  </span>
                  <span className="flex-1 text-left">{opt.label}</span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-base text-primary"
                    >
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
