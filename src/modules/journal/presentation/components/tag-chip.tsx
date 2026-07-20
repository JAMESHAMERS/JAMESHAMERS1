import type { JournalTag } from "../../domain/types";
import { cn } from "@/shared/lib/utils";

export function TagChip({ tag, className }: { tag: JournalTag; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium",
        className,
      )}
      style={{
        borderColor: `${tag.color}55`,
        color: tag.color,
        backgroundColor: `${tag.color}14`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </span>
  );
}
