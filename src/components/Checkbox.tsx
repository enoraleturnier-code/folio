import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  /** "sm" pour les listes denses (ex. sélection de projets) — "md" par défaut ailleurs (RGPD, etc.). */
  size?: "md" | "sm";
};

export function Checkbox({ className, size = "md", ...props }: CheckboxProps) {
  const boxCls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const iconSize = size === "sm" ? 11 : 14;
  return (
    <span className={cn("relative inline-flex shrink-0", boxCls)}>
      <input
        type="checkbox"
        className={cn(
          "peer cursor-pointer appearance-none rounded-full border border-outline bg-transparent transition-colors checked:border-primary-container checked:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          boxCls,
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        size={iconSize}
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto text-on-primary-container opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}
