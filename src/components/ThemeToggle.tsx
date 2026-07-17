import { Check, Contrast, Moon, Sun, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { IconTooltip } from "@/components/IconTooltip";
import { useThemeMode, type ThemeMode } from "@/hooks/useThemeMode";

export function ThemeToggle() {
  const { mode, choose: chooseMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    chooseMode(next);
    setOpen(false);
  };

  const options: { key: ThemeMode; icon: LucideIcon; label: string; disabled?: boolean }[] = [
    { key: "dark", icon: Moon, label: "Sombre" },
    { key: "light", icon: Sun, label: "Clair", disabled: true },
    { key: "system", icon: Contrast, label: "Auto", disabled: true },
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
        <div className="absolute right-0 z-[80] mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-2xl">
          <div className="flex flex-col py-1">
            {options.map((opt) => {
              const active = mode === opt.key;
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => choose(opt.key)}
                  disabled={opt.disabled}
                  aria-disabled={opt.disabled}
                  className={
                    "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset " +
                    (opt.disabled
                      ? "cursor-not-allowed text-on-surface-variant/50"
                      : "hover:bg-white/5 hover:text-on-surface " +
                        (active ? "text-primary" : "text-on-surface-variant"))
                  }
                >
                  <OptIcon aria-hidden="true" size={18} />
                  <span className="flex-1 text-left">{opt.label}</span>
                  {opt.disabled && <ComingSoonBadge />}
                  {active && !opt.disabled && <Check aria-hidden="true" className="text-primary" size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
