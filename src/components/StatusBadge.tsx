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
  public: "bg-primary/20 border-primary/30 text-primary",
  confidential: "bg-secondary/80 border-white/10 text-on-surface",
  draft: "bg-white/5 border-white/10 text-on-surface-variant",
  deleted: "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]",
  pending: "bg-[#FBB040]/10 border-[#FBB040]/30 text-[#FBB040]",
  approved: "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]",
  rejected: "bg-[#F87171]/10 border-[#F87171]/30 text-[#F87171]",
  nouveau: "bg-indigo-500/10 border-indigo-500/30 text-[#818CF8]",
  traite: "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]",
  archive: "bg-slate-500/10 border-slate-500/30 text-slate-300",
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

export function StatusBadge({ kind }: { kind: StatusKind }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest",
        styles[kind],
      )}
    >
      {labels[kind]}
    </span>
  );
}
