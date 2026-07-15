import { cn } from "@/lib/utils";

interface NotificationCountBadgeProps {
  count: number;
  className?: string;
}

/** Pastille de comptage partagée -- même style que le badge de la cloche Notifications
 * (bg-secondary/text-on-secondary), reprise aussi sur les items de la sidebar admin pour
 * une seule et même apparence, quelle que soit la section ou l'utilisateur. */
export function NotificationCountBadge({ count, className }: NotificationCountBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
