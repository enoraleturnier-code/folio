import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { tagBadgeStyles, type TagCategory } from "@/components/TagBadge";
import { ensureRefValue, type RefRow, type RefTable } from "@/data/projectRefs";
import { cn } from "@/lib/utils";

interface TagPickerProps {
  label: string;
  category: TagCategory;
  refTable: RefTable;
  fetchOptions: () => Promise<RefRow[]>;
  selected: string[];
  onChange: (names: string[]) => void;
}

export function TagPicker({
  label,
  category,
  refTable,
  fetchOptions,
  selected,
  onChange,
}: TagPickerProps) {
  const [options, setOptions] = useState<RefRow[]>([]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOptions()
      .then(setOptions)
      .catch(() => setOptions([]));
    // fetchOptions volontairement absent des deps : identité de fonction
    // stable attendue côté appelant, un seul chargement à l'ouverture du drawer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const remove = (name: string) => onChange(selected.filter((n) => n !== name));

  const addExisting = (name: string) => {
    if (!selected.includes(name)) onChange([...selected, name]);
    setOpen(false);
  };

  const addNew = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const row = await ensureRefValue(refTable, trimmed, options);
      if (!options.some((o) => o.id === row.id)) setOptions((prev) => [...prev, row]);
      if (!selected.some((n) => n.toLowerCase() === row.name.toLowerCase())) {
        onChange([...selected, row.name]);
      }
      setInput("");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const unselectedOptions = options.filter((o) => !selected.includes(o.name));

  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-on-surface-variant">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((name) => (
          <span
            key={name}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1.5 text-[11px] font-medium tracking-wide",
              tagBadgeStyles[category],
            )}
          >
            {name}
            <button
              type="button"
              onClick={() => remove(name)}
              aria-label={`Retirer ${name}`}
              className="rounded-full p-0.5 hover:bg-white/10"
            >
              <X aria-hidden="true" size={11} />
            </button>
          </span>
        ))}

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={`Ajouter ${label.toLowerCase()}`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:bg-white/10"
          >
            <Plus aria-hidden="true" size={14} />
          </button>

          {open && (
            <div className="absolute left-0 top-8 z-20 w-56 rounded-xl border border-white/10 bg-surface-container-lowest p-3 shadow-2xl">
              {unselectedOptions.length > 0 && (
                <div className="mb-2 flex max-h-32 flex-col gap-1 overflow-y-auto">
                  {unselectedOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => addExisting(o.name)}
                      className="rounded-lg px-2 py-1.5 text-left text-xs text-on-surface hover:bg-white/5"
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 border-t border-white/5 pt-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNew())}
                  placeholder="Nouveau tag..."
                  className="min-w-0 flex-1 rounded-lg border border-white/5 bg-surface-container px-2 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={addNew}
                  disabled={!input.trim() || busy}
                  aria-label="Créer ce tag"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary disabled:opacity-50"
                >
                  <Plus aria-hidden="true" size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
