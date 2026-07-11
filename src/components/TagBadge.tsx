import { cn } from "@/lib/utils";

export type TagCategory = "designType" | "sector" | "tools" | "keywords";

export const tagBadgeStyles: Record<TagCategory, string> = {
  designType: "bg-tag-design-type/10 border-tag-design-type/30 text-tag-design-type",
  sector: "bg-tag-sector/10 border-tag-sector/30 text-tag-sector",
  tools: "bg-tag-tools/10 border-tag-tools/30 text-tag-tools",
  keywords: "bg-tag-keywords/10 border-tag-keywords/30 text-tag-keywords",
};

interface TagBadgeProps {
  category: TagCategory;
  label: string;
}

export function TagBadge({ category, label }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide",
        tagBadgeStyles[category],
      )}
    >
      {label}
    </span>
  );
}
