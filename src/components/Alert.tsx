import { CircleAlert, CircleCheckBig, Info, TriangleAlert, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { IconTooltip } from "@/components/IconTooltip";
import { cn } from "@/lib/utils";

export type AlertType = "info" | "success" | "warning" | "error";

interface AlertProps {
  type: AlertType;
  title: string;
  description?: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  /** Remplace l'icône par défaut du type (ex. Sparkles pour un contexte IA). */
  icon?: LucideIcon;
}

const icons: Record<AlertType, LucideIcon> = {
  info: Info,
  success: CircleCheckBig,
  warning: TriangleAlert,
  error: CircleAlert,
};

const styles: Record<AlertType, string> = {
  info: "bg-tertiary/15 border-tertiary/40 text-tertiary",
  success: "bg-primary/15 border-primary/40 text-primary",
  warning: "bg-warning/15 border-warning/40 text-warning",
  error: "bg-error/15 border-error/40 text-error",
};

// Erreur et succès sont transitoires et méritent une annonce assertive ;
// info et avertissement sont moins urgents, une annonce polie suffit.
const roles: Record<AlertType, "alert" | "status"> = {
  info: "status",
  success: "alert",
  warning: "status",
  error: "alert",
};

export function Alert({ type, title, description, dismissible, onClose, icon }: AlertProps) {
  const Icon = icon ?? icons[type];
  return (
    <div
      role={roles[type]}
      className={cn("flex items-start gap-3 rounded-xl border p-4", styles[type])}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-xs font-light text-on-surface-variant">{description}</p>
        )}
      </div>
      {dismissible && (
        <IconTooltip label="Fermer l'alerte">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'alerte"
            className="flex shrink-0 items-center justify-center rounded-full p-1 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface max-md:h-11 max-md:w-11"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </IconTooltip>
      )}
    </div>
  );
}
