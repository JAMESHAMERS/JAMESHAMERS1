import { ListChecksIcon } from "lucide-react";

import type { Task } from "../../domain/types";
import { subtaskProgress } from "../../domain/rules";
import { cn } from "@/shared/lib/utils";

export function SubtaskProgress({ task, className }: { task: Task; className?: string }) {
  if (task.subtasks.length === 0) return null;
  const { done, total } = subtaskProgress(task);

  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1 text-xs",
        done === total && "text-success",
        className,
      )}
    >
      <ListChecksIcon className="size-3" />
      {done}/{total}
    </span>
  );
}
