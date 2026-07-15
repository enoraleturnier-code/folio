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
  size?: "sm" | "md";
}

export function TagBadge({ category, label, size = "sm" }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-normal tracking-wide",
        size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]",
        tagBadgeStyles[category],
      )}
    >
      {label}
    </span>
  );
}
