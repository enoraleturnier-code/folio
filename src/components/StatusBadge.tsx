import { Check, Lock, NotebookPen, Trash2, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type StatusKind =
  | "public"
  | "confidential"
  | "draft"
  | "deleted"
  | "pending"
  | "approved"
  | "rejected"
  | "nouveau"
  | "traite"
  | "archive";

const styles: Record<StatusKind, string> = {
  public: "bg-primary/10 border-primary/30 text-primary",
  confidential: "bg-secondary/80 border-white/10 text-white",
  draft: "bg-white/5 border-white/10 text-on-surface-variant",
  deleted: "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]",
  pending: "bg-[#FBB040]/10 border-[#FBB040]/30 text-[#FBB040]",
  approved: "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]",
  rejected: "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]",
  nouveau: "bg-indigo-500/10 border-indigo-500/30 text-[#818CF8]",
  traite: "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]",
  archive: "bg-white/5 border-white/10 text-on-surface-variant",
};

const labels: Record<StatusKind, string> = {
  public: "Publique",
  confidential: "CONFIDENTIEL",
  draft: "Brouillon",
  deleted: "Supprimé",
  pending: "En attente",
  approved: "Validée",
  rejected: "Refusée",
  nouveau: "Nouveau",
  traite: "Traité",
  archive: "Archivé",
};

const icons: Partial<Record<StatusKind, LucideIcon>> = {
  public: Check,
  confidential: Lock,
  draft: NotebookPen,
  deleted: Trash2,
  traite: Check,
};

/** `suffix` : contexte additionnel affiché après le label (ex. "Confidentiel • Sensible" dans le dashboard admin). */
export function StatusBadge({ kind, suffix }: { kind: StatusKind; suffix?: string }) {
  const Icon = icons[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-normal uppercase tracking-widest",
        styles[kind],
      )}
    >
      {Icon && <Icon aria-hidden="true" size={14} />}
      {labels[kind]}
      {suffix && <span className="normal-case">&nbsp;• {suffix}</span>}
    </span>
  );
}
