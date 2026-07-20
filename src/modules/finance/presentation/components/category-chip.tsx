import type { Category } from "../../domain/types";
import { cn } from "@/shared/lib/utils";

export function CategoryChip({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium",
        className,
      )}
      style={{
        borderColor: `${category.color}55`,
        color: category.color,
        backgroundColor: `${category.color}14`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: category.color }} />
      {category.name}
    </span>
  );
}
