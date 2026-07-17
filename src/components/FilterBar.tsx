import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { IconTooltip } from "@/components/IconTooltip";
import { SlideSheet } from "@/components/SlideSheet";
import { formatSecteur } from "@/lib/secteurLabels";

export interface FilterState {
  designType: string;
  sector: string;
  tools: string;
  keywords: string;
}

interface FilterBarProps {
  options: {
    designType: string[];
    sector: string[];
    tools: string[];
    keywords: string[];
  };
  value: FilterState;
  onChange: (v: FilterState) => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const activeClasses: Record<keyof FilterState, string> = {
  designType: "border-tag-design-type/40 bg-tag-design-type/15 text-tag-design-type",
  sector: "border-tag-sector/40 bg-tag-sector/15 text-tag-sector",
  tools: "border-tag-tools/40 bg-tag-tools/15 text-tag-tools",
  keywords: "border-tag-keywords/40 bg-tag-keywords/15 text-tag-keywords",
};

const hoverClasses: Record<keyof FilterState, string> = {
  designType: "hover:border-tag-design-type/40 hover:bg-tag-design-type/15 hover:text-tag-design-type",
  sector: "hover:border-tag-sector/40 hover:bg-tag-sector/15 hover:text-tag-sector",
  tools: "hover:border-tag-tools/40 hover:bg-tag-tools/15 hover:text-tag-tools",
  keywords: "hover:border-tag-keywords/40 hover:bg-tag-keywords/15 hover:text-tag-keywords",
};

const secondaryCategories: { key: keyof FilterState; label: string }[] = [
  { key: "sector", label: "Secteur" },
  { key: "tools", label: "Outils" },
  { key: "keywords", label: "Mots-clés" },
];

function pillClass(key: keyof FilterState, active: boolean) {
  return (
    "rounded-full border px-4 py-1.5 text-sm transition-colors " +
    focusRing +
    " " +
    (active
      ? `font-semibold ${activeClasses[key]}`
      : `font-normal border-outline text-on-surface-variant ${hoverClasses[key]}`)
  );
}

/** Libellé humain pour une option de filtre — seul le secteur a un mapping enum → libellé. */
function optionLabel(key: keyof FilterState, opt: string): string {
  return key === "sector" ? formatSecteur(opt) : opt;
}

export function FilterBar({ options, value, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleSecondaryCategories = secondaryCategories.filter((c) => options[c.key].length > 0);
  const activeSecondaryCount = visibleSecondaryCategories.filter((c) => value[c.key] !== "").length;

  const hasTypeOptions = options.designType.length > 0;

  const secondaryCategoriesFields = visibleSecondaryCategories.map((c) => (
    <div key={c.key} className="flex flex-col gap-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-on-surface-variant/65">
        {c.label}
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...value, [c.key]: "" })}
          aria-pressed={value[c.key] === ""}
          className={pillClass(c.key, value[c.key] === "")}
        >
          Tous
        </button>
        {options[c.key].map((opt) => {
          const active = value[c.key] === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange({ ...value, [c.key]: active ? "" : opt })}
              aria-pressed={active}
              className={pillClass(c.key, active)}
            >
              {optionLabel(c.key, opt)}
            </button>
          );
        })}
      </div>
    </div>
  ));

  return (
    <div className="space-y-4">
      {(visibleSecondaryCategories.length > 0 || hasTypeOptions) && (
        <div className="scrollbar-hide flex items-center gap-4 overflow-x-auto whitespace-nowrap border-b border-white/5 pb-6 md:flex-wrap md:overflow-visible md:whitespace-normal">
          {visibleSecondaryCategories.length > 0 && (
            <>
              <IconTooltip label="Filtrer">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  aria-label="Filtrer"
                  className={
                    "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors " +
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
              <div className="h-8 w-px shrink-0 bg-white/10" />
            </>
          )}

          {hasTypeOptions && (
            <div className="flex shrink-0 gap-2 md:flex-wrap">
              <button
                type="button"
                onClick={() => onChange({ ...value, designType: "" })}
                aria-pressed={value.designType === ""}
                className={"shrink-0 " + pillClass("designType", value.designType === "")}
              >
                Tous les types
              </button>
              {options.designType.map((opt) => {
                const active = value.designType === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange({ ...value, designType: active ? "" : opt })}
                    aria-pressed={active}
                    className={"shrink-0 " + pillClass("designType", active)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Desktop : panneau inline sous la barre. Mobile : SlideSheet plein-hauteur ci-dessous. */}
      {expanded && visibleSecondaryCategories.length > 0 && (
        <div className="hidden border-b border-white/5 pb-6 pt-2 md:flex md:flex-wrap md:gap-x-12 md:gap-y-5">
          {secondaryCategoriesFields}
        </div>
      )}

      <SlideSheet
        open={expanded && visibleSecondaryCategories.length > 0}
        onClose={() => setExpanded(false)}
        from="left"
        ariaLabel="Filtrer les projets"
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
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </IconTooltip>
        </div>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {secondaryCategoriesFields}
        </div>
        <div className="shrink-0 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={
              "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container transition-all hover:brightness-110 active:scale-[0.98] " +
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
