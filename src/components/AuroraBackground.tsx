import { cn } from "@/lib/utils";

export type AuroraVariant = "profile" | "catalogue" | "modal";

interface AuroraBackgroundProps {
  /** Change la répartition des 3 taches de couleur selon l'espace — même
   * famille de couleurs partout (aurora-teal/purple/cyan), cf. DESIGN.md. */
  variant?: AuroraVariant;
}

export function AuroraBackground({ variant = "profile" }: AuroraBackgroundProps) {
  return (
    <div
      className={cn("aurora-bg", variant !== "profile" && `aurora-bg--${variant}`)}
      aria-hidden="true"
    >
      <div className="aurora-blob" />
    </div>
  );
}
