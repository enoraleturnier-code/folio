import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { IconTooltip } from "@/components/IconTooltip";
import { SlideSheet } from "@/components/SlideSheet";

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
    "inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-sm transition-colors max-md:min-h-[34px] " +
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

  const secondaryGroupsFields = secondaryGroups.map((g) => (
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
  ));

  return (
    <div className="space-y-4">
      <div className="scrollbar-hide flex items-center gap-4 overflow-x-auto whitespace-nowrap border-b border-white/5 pb-6 max-md:-mr-5 max-md:pr-5 md:flex-wrap md:overflow-visible md:whitespace-normal">
        {secondaryGroups.length > 0 && (
          <>
            <IconTooltip label="Filtrer">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label="Filtrer"
                className={
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors max-md:h-11 max-md:w-11 " +
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
            {primaryGroups.length > 0 && <div className="h-8 w-px shrink-0 bg-white/10" />}
          </>
        )}

        {primaryGroups.map((g) => (
          <div key={g.key} className="flex shrink-0 gap-2 md:flex-wrap">
            <button
              type="button"
              onClick={() => setGroupValue(g.key, "")}
              aria-pressed={!value[g.key]}
              className={"shrink-0 " + pillClass(!value[g.key])}
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
                  className={"shrink-0 " + pillClass(active)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Desktop : panneau inline sous la barre. Mobile : SlideSheet plein-hauteur ci-dessous. */}
      {expanded && secondaryGroups.length > 0 && (
        <div className="hidden border-b border-white/5 pb-6 pt-2 md:flex md:flex-wrap md:gap-x-12 md:gap-y-5">
          {secondaryGroupsFields}
        </div>
      )}

      <SlideSheet
        open={expanded && secondaryGroups.length > 0}
        onClose={() => setExpanded(false)}
        from="left"
        ariaLabel="Filtrer"
        closeOnBackdropClick
        className="md:hidden"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-widest text-on-surface">
            Filtrer
          </span>
          <IconTooltip label="Fermer">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Fermer"
              className="flex items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-md:h-11 max-md:w-11"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </IconTooltip>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {secondaryGroupsFields}
        </div>
        <div className="shrink-0 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={
              "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container transition-all hover:brightness-110 active:scale-[0.98] max-md:min-h-11 " +
              focusRing
            }
          >
            <SlidersHorizontal aria-hidden="true" size={16} />
            Filtrer{activeSecondaryCount > 0 ? ` (${activeSecondaryCount})` : ""}
          </button>
        </div>
      </SlideSheet>
    </div>
  );
}
