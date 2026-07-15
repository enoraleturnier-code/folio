import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { IconTooltip } from "@/components/IconTooltip";

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilterGroup {
  key: string;
  label: string;
  /** Groupe toujours visible (hors du toggle "Filtrer"). */
  primary?: boolean;
  options: AdminFilterOption[];
}

interface AdminFilterBarProps {
  groups: AdminFilterGroup[];
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function pillClass(active: boolean) {
  return (
    "rounded-full border px-4 py-1.5 text-sm transition-colors " +
    focusRing +
    " " +
    (active
      ? "border-primary/40 bg-primary/15 font-semibold text-primary"
      : "border-outline font-normal text-on-surface-variant hover:border-primary/40 hover:bg-primary/15 hover:text-primary")
  );
}

/** Bouton "Filtrer" générique — reprend le shell visuel de FilterBar (catalogue public) pour les onglets admin. */
export function AdminFilterBar({ groups, value, onChange }: AdminFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const primaryGroups = groups.filter((g) => g.primary && g.options.length > 0);
  const secondaryGroups = groups.filter((g) => !g.primary && g.options.length > 0);
  const activeSecondaryCount = secondaryGroups.filter((g) => value[g.key]).length;

  if (primaryGroups.length === 0 && secondaryGroups.length === 0) return null;

  const setGroupValue = (key: string, next: string) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 border-b border-white/5 pb-6">
        {secondaryGroups.length > 0 && (
          <>
            <IconTooltip label="Filtrer">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label="Filtrer"
                className={
                  "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors " +
                  focusRing +
                  " " +
                  (expanded || activeSecondaryCount > 0
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-outline text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary")
                }
              >
                <SlidersHorizontal aria-hidden="true" size={16} />
                {activeSecondaryCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[9px] font-bold text-on-primary">
                    {activeSecondaryCount}
                  </span>
                )}
              </button>
            </IconTooltip>
            {primaryGroups.length > 0 && <div className="h-8 w-px bg-white/10" />}
          </>
        )}

        {primaryGroups.map((g) => (
          <div key={g.key} className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGroupValue(g.key, "")}
              aria-pressed={!value[g.key]}
              className={pillClass(!value[g.key])}
            >
              Tous
            </button>
            {g.options.map((opt) => {
              const active = value[g.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGroupValue(g.key, active ? "" : opt.value)}
                  aria-pressed={active}
                  className={pillClass(active)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {expanded && secondaryGroups.length > 0 && (
        <div className="flex flex-wrap gap-x-12 gap-y-5 border-b border-white/5 pb-6 pt-2">
          {secondaryGroups.map((g) => (
            <div key={g.key} className="flex flex-col gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-on-surface-variant/65">
                {g.label}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setGroupValue(g.key, "")}
                  aria-pressed={!value[g.key]}
                  className={pillClass(!value[g.key])}
                >
                  Tous
                </button>
                {g.options.map((opt) => {
                  const active = value[g.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGroupValue(g.key, active ? "" : opt.value)}
                      aria-pressed={active}
                      className={pillClass(active)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
