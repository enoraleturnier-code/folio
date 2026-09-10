import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { textLinkClass } from "@/lib/linkStyles";
import { FOCUS_RING, cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Fil d'Ariane -- sous la navbar sur les pages profondes (catalogue, fiche
 * projet). Dernier item = page courante, sans lien, `aria-current="page"`. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight
                aria-hidden="true"
                size={14}
                className="shrink-0 text-on-surface-variant/50"
              />
            )}
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? "page" : undefined}
                className="truncate font-medium text-on-surface"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className={cn("truncate", textLinkClass("default"), FOCUS_RING, "rounded")}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
