import { ArrowRight, Zap, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/utils";

interface Persona {
  name: string;
  role: string;
  email: string;
  password: string;
}

const PERSONAS: Persona[] = [
  {
    name: "Léa Martin",
    role: "admin",
    email: "enoraleturnier+lea-persona@gmail.com",
    password: "Test1234!",
  },
  {
    name: "Sophie Michelle",
    role: "pending",
    email: "enoraleturnier+sophie-persona@gmail.com",
    password: "Test1234!",
  },
  {
    name: "Karim Mansouri",
    role: "validated_visitor",
    email: "enoraleturnier+karim-persona@gmail.com",
    password: "Test1234!",
  },
];

export function PersonaSwitcher() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const switchTo = async (persona: Persona) => {
    setBusy(persona.email);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: persona.email,
      password: persona.password,
    });
    if (err) {
      setError(err.message);
      setBusy(null);
      return;
    }
    window.location.reload();
  };

  const signOut = async () => {
    setBusy("__signout__");
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40" ref={ref}>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 rounded-2xl border border-white/10 bg-black/40 p-3 text-xs shadow-2xl backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Persona switcher (dev)
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le sélecteur de personas"
              className="rounded-full p-1 text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X aria-hidden="true" size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => switchTo(p)}
                disabled={busy !== null}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-surface-container-lowest px-3 py-2 text-left transition-colors hover:border-primary disabled:opacity-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-on-primary/15 text-[11px] font-bold text-primary">
                  {initials(p.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-on-surface">
                    {busy === p.email ? "Connexion…" : p.name}
                  </span>
                  <span className="block text-[10px] text-on-surface-variant">{p.role}</span>
                </span>
                <ArrowRight aria-hidden="true" size={14} className="shrink-0 text-on-surface-variant" />
              </button>
            ))}
            <button
              type="button"
              onClick={signOut}
              disabled={busy !== null}
              className="w-full rounded-full bg-primary-container px-3 py-1.5 text-center font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:brightness-100"
            >
              {busy === "__signout__" ? "…" : "Se déconnecter"}
            </button>
          </div>
          {error && <p className="mt-2 text-error">{error}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Ouvrir le sélecteur de personas"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-on-surface shadow-2xl backdrop-blur-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Zap aria-hidden="true" size={14} className="text-primary" />
        Personas
      </button>
    </div>
  );
}
