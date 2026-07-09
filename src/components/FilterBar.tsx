import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

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

const activeClasses: Record<keyof FilterState, string> = {
  designType: "border-fuchsia-500/30 bg-fuchsia-500/10 text-[#D946EF]",
  sector: "border-cyan-500/30 bg-cyan-500/10 text-[#22D3EE]",
  tools: "border-sky-500/30 bg-sky-500/10 text-[#38BDF8]",
  keywords: "border-indigo-500/30 bg-indigo-500/10 text-[#818CF8]",
};

const hoverClasses: Record<keyof FilterState, string> = {
  designType: "hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-[#D946EF]",
  sector: "hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-[#22D3EE]",
  tools: "hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-[#38BDF8]",
  keywords: "hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-[#818CF8]",
};

const secondaryCategories: { key: keyof FilterState; label: string }[] = [
  { key: "sector", label: "Secteur" },
  { key: "tools", label: "Outils" },
  { key: "keywords", label: "Mots-clés" },
];

function pillClass(key: keyof FilterState, active: boolean) {
  return (
    "rounded-full border px-4 py-1.5 text-sm transition-colors " +
    (active ? activeClasses[key] : `border-white/10 text-on-surface-variant ${hoverClasses[key]}`)
  );
}

export function FilterBar({ options, value, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleSecondaryCategories = secondaryCategories.filter((c) => options[c.key].length > 0);
  const activeSecondaryCount = visibleSecondaryCategories.filter((c) => value[c.key] !== "").length;

  const hasTypeOptions = options.designType.length > 0;

  return (
    <div className="space-y-4">
      {(visibleSecondaryCategories.length > 0 || hasTypeOptions) && (
        <div className="flex flex-wrap items-center gap-4 border-b border-white/5 pb-6">
          {visibleSecondaryCategories.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label="Plus de filtres"
                className={
                  "flex items-center gap-2 rounded-full border px-5 py-2 text-[10px] font-bold transition-all " +
                  (expanded || activeSecondaryCount > 0
                    ? "border-primary text-primary"
                    : "border-white/20 text-on-surface hover:border-primary hover:text-primary")
                }
              >
                <SlidersHorizontal aria-hidden="true" size={14} />
                Filtrer
                {activeSecondaryCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-[9px] font-bold text-on-primary">
                    {activeSecondaryCount}
                  </span>
                )}
              </button>
              <div className="h-8 w-px bg-white/10" />
            </>
          )}

          {hasTypeOptions && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...value, designType: "" })}
                className={pillClass("designType", value.designType === "")}
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
                    className={pillClass("designType", active)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {expanded && visibleSecondaryCategories.length > 0 && (
        <div className="flex flex-wrap gap-x-12 gap-y-5 border-b border-white/5 pb-6 pt-2">
          {visibleSecondaryCategories.map((c) => (
            <div key={c.key} className="flex flex-col gap-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-on-surface-variant/65">
                {c.label}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...value, [c.key]: "" })}
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
                      className={pillClass(c.key, active)}
                    >
                      {opt}
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
