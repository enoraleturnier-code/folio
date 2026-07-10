import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span className="relative inline-flex h-5 w-5 shrink-0">
      <input
        type="checkbox"
        className={cn(
          "peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-outline bg-transparent transition-colors checked:border-primary-container checked:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        size={14}
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto text-on-primary-container opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}
