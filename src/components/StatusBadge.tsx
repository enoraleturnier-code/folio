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
  deleted: "bg-error/10 border-error/30 text-error",
  pending: "bg-warning/10 border-warning/30 text-warning",
  approved: "bg-success/10 border-success/30 text-success",
  rejected: "bg-error/10 border-error/30 text-error",
  nouveau: "bg-info/10 border-info/30 text-info",
  traite: "bg-success/10 border-success/30 text-success",
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
export function StatusBadge({
  kind,
  suffix,
  size = "sm",
}: {
  kind: StatusKind;
  suffix?: string;
  size?: "sm" | "md";
}) {
  const Icon = icons[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-normal uppercase tracking-widest",
        size === "md" ? "px-4 py-1.5 text-xs" : "px-3 py-1 text-[10px]",
        styles[kind],
      )}
    >
      {Icon && <Icon aria-hidden="true" size={size === "md" ? 16 : 14} />}
      {labels[kind]}
      {suffix && <span className="normal-case">&nbsp;• {suffix}</span>}
    </span>
  );
}
