import { Flame } from "lucide-react";

/** Pastille "rôle info" (token tertiary) pour signaler une fonctionnalité temporairement indisponible -- même gabarit que les autres badges de statut du projet (px-3 py-1, text-[10px] font-normal uppercase tracking-widest, rounded-full, cf. StatusBadge). */
export function ComingSoonBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-tertiary/40 bg-tertiary/15 px-3 py-1 text-[10px] font-normal uppercase tracking-widest text-tertiary">
      <Flame aria-hidden="true" size={11} />
      Bientôt disponible
    </span>
  );
}
