import { Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { tagBadgeStyles, type TagCategory } from "@/components/TagBadge";
import { IconTooltip } from "@/components/IconTooltip";
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
  const newTagInputId = `tp-new-tag-${category}`;

  return (
    <fieldset className="m-0 space-y-2 border-0 p-0">
      <legend className="flex items-center gap-1.5 p-0 text-sm font-medium text-on-surface-variant">
        <Sparkles aria-hidden="true" size={14} />
        {label}
      </legend>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => remove(name)}
            aria-label={`Retirer ${name}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-2.5 pr-1 text-[10px] font-normal tracking-wide transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-md:min-h-[34px]",
              tagBadgeStyles[category],
            )}
          >
            {name}
            <X aria-hidden="true" size={11} />
          </button>
        ))}

        <div className="relative" ref={ref}>
          <IconTooltip label="Ajouter">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={`Ajouter ${label.toLowerCase()}`}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-on-surface-variant transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:h-11 max-md:w-11"
            >
              <Plus aria-hidden="true" size={14} />
            </button>
          </IconTooltip>

          {open && (
            <div className="absolute left-0 top-8 z-20 w-56 rounded-xl border border-white/10 bg-surface-container-lowest p-3 shadow-2xl">
              {unselectedOptions.length > 0 && (
                <div className="mb-2 flex max-h-32 flex-col gap-1 overflow-y-auto">
                  {unselectedOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => addExisting(o.name)}
                      className="rounded-lg px-2 py-1.5 text-left text-xs text-on-surface hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-2 md:flex-row md:items-center md:gap-1">
                <label htmlFor={newTagInputId} className="sr-only">
                  Nouveau tag pour {label.toLowerCase()}
                </label>
                <input
                  id={newTagInputId}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNew())}
                  placeholder="Nouveau tag..."
                  className="min-w-0 w-full rounded-lg border border-white/5 bg-surface-container px-2 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary md:flex-1"
                />
                <IconTooltip label="Créer">
                  <button
                    type="button"
                    onClick={addNew}
                    disabled={!input.trim() || busy}
                    aria-label="Créer ce tag"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background max-md:h-11 max-md:w-full"
                  >
                    <Plus aria-hidden="true" size={14} />
                  </button>
                </IconTooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
}
