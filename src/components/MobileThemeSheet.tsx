import { Check, Contrast, Moon, Sun, X, type LucideIcon } from "lucide-react";

import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { SlideSheet } from "@/components/SlideSheet";
import { useThemeMode, type ThemeMode } from "@/hooks/useThemeMode";

const OPTIONS: { key: ThemeMode; icon: LucideIcon; label: string; disabled?: boolean }[] = [
  { key: "dark", icon: Moon, label: "Sombre" },
  { key: "light", icon: Sun, label: "Clair", disabled: true },
  { key: "system", icon: Contrast, label: "Auto", disabled: true },
];

/** Feuille plein écran mobile -- remplace le dropdown desktop de ThemeToggle
 * (bouton thème de l'entête publique, visiteur non connecté ou connecté). */
export function MobileThemeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mode, choose } = useThemeMode();

  return (
    <SlideSheet open={open} onClose={onClose} from="bottom" ariaLabel="Choisir le thème">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
        <h2 className="text-xl font-medium text-on-surface">Choisir le thème</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-md:h-11 max-md:w-11"
        >
          <X aria-hidden="true" size={24} />
        </button>
      </div>
      <div className="flex flex-col py-2">
        {OPTIONS.map((opt) => {
          const active = mode === opt.key;
          const OptIcon = opt.icon;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                if (opt.disabled) return;
                choose(opt.key);
                onClose();
              }}
              disabled={opt.disabled}
              aria-disabled={opt.disabled}
              className={
                "flex w-full items-center gap-3 px-6 py-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset " +
                (opt.disabled
                  ? "cursor-not-allowed text-on-surface-variant/50"
                  : "hover:bg-white/5 " + (active ? "text-primary" : "text-on-surface"))
              }
            >
              <OptIcon aria-hidden="true" size={20} />
              <span className="flex-1 text-left">{opt.label}</span>
              {opt.disabled && <ComingSoonBadge />}
              {active && !opt.disabled && <Check aria-hidden="true" className="text-primary" size={20} />}
            </button>
          );
        })}
      </div>
    </SlideSheet>
  );
}
