import { useMemo, useState } from "react";

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

const categories: { key: keyof FilterState; label: string; color: string }[] = [
  { key: "designType", label: "Type", color: "text-[#D946EF] border-fuchsia-500/30" },
  { key: "sector", label: "Secteur", color: "text-[#22D3EE] border-cyan-500/30" },
  { key: "tools", label: "Outils", color: "text-[#38BDF8] border-sky-500/30" },
  { key: "keywords", label: "Mots-clés", color: "text-[#818CF8] border-indigo-500/30" },
];

export function FilterBar({ options, value, onChange }: FilterBarProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => options, [options]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-surface-container px-5 py-3">
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant">
          search
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un projet, un client, un outil…"
          aria-label="Rechercher"
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-xs font-medium text-on-surface-variant hover:text-primary"
          >
            Effacer
          </button>
        )}
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.key} className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {c.label}
            </span>
            <button
              type="button"
              onClick={() => onChange({ ...value, [c.key]: "" })}
              className={
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (value[c.key] === ""
                  ? "border-white/25 bg-white/5 text-on-surface"
                  : "border-white/10 text-on-surface-variant hover:text-on-surface")
              }
            >
              Tous
            </button>
            {filteredOptions[c.key].map((opt) => {
              const active = value[c.key] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ ...value, [c.key]: active ? "" : opt })}
                  className={
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                    (active
                      ? `${c.color} bg-white/5`
                      : "border-white/10 text-on-surface-variant hover:text-on-surface")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
