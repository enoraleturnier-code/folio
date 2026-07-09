import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/utils";

interface Persona {
  name: string;
  role: string;
  email: string;
  password: string;
}

const PERSONAS: Persona[] = [
  { name: "Léa Martin", role: "admin", email: "lea@folioplus.app", password: "Test1234!" },
  {
    name: "Sophie Michelle",
    role: "pending",
    email: "sophie@folioplus.app",
    password: "Test1234!",
  },
  {
    name: "Karim Mansouri",
    role: "validated_visitor",
    email: "karim@folioplus.app",
    password: "Test1234!",
  },
];

export function PersonaSwitcher() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="fixed bottom-4 right-4 z-[9999] w-44 rounded-2xl border border-white/10 bg-black/40 p-3 text-xs shadow-2xl backdrop-blur-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-primary">
        Persona switcher (dev)
      </p>
      <div className="space-y-2">
        {PERSONAS.map((p) => (
          <button
            key={p.email}
            type="button"
            onClick={() => switchTo(p)}
            disabled={busy !== null}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-surface-container-lowest px-3 py-2 text-left hover:border-primary disabled:opacity-50"
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
      {error && <p className="mt-2 text-[#F87171]">{error}</p>}
    </div>
  );
}
