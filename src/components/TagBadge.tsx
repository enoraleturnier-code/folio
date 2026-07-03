import { cn } from "@/lib/utils";

export type TagCategory = "designType" | "sector" | "tools" | "keywords";

const styles: Record<TagCategory, string> = {
  designType: "bg-fuchsia-500/10 border-fuchsia-500/30 text-[#D946EF]",
  sector: "bg-cyan-500/10 border-cyan-500/30 text-[#22D3EE]",
  tools: "bg-sky-500/10 border-sky-500/30 text-[#38BDF8]",
  keywords: "bg-indigo-500/10 border-indigo-500/30 text-[#818CF8]",
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
        styles[category],
      )}
    >
      {label}
    </span>
  );
}
