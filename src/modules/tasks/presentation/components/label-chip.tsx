import type { Label } from "../../domain/types";
import { cn } from "@/shared/lib/utils";

export function LabelChip({ label, className }: { label: Label; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-medium",
        className,
      )}
      style={{ borderColor: `${label.color}55`, color: label.color, backgroundColor: `${label.color}14` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: label.color }} />
      {label.name}
    </span>
  );
}
