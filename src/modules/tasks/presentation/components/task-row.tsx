"use client";

import { ChevronRightIcon } from "lucide-react";

import type { Task } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { LabelChip } from "./label-chip";
import { DueDateBadge } from "./due-date-badge";
import { SubtaskProgress } from "./subtask-progress";
import { StatusSelect } from "./status-select";
import { PrioritySelect } from "./priority-select";

export function TaskRow({ task }: { task: Task }) {
  const selectTask = useTaskStore((s) => s.selectTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const labels = useTaskStore((s) => s.labels);
  const taskLabels = labels.filter((l) => task.labelIds.includes(l.id));

  return (
    <div className="hover:bg-accent/40 grid grid-cols-[1fr_auto] items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0 sm:grid-cols-[1fr_140px_120px_44px]">
      <button
        type="button"
        onClick={() => selectTask(task.id)}
        className="flex min-w-0 flex-col items-start gap-1 text-left"
      >
        <span
          className={cn(
            "truncate text-sm font-medium",
            task.status === "done" && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {taskLabels.map((label) => (
            <LabelChip key={label.id} label={label} />
          ))}
          <DueDateBadge task={task} />
          <SubtaskProgress task={task} />
        </div>
      </button>

      <StatusSelect
        value={task.status}
        onChange={(status) => void updateTask(task.id, { status })}
        className="hidden sm:flex"
      />
      <PrioritySelect
        value={task.priority}
        onChange={(priority) => void updateTask(task.id, { priority })}
        className="hidden sm:flex"
      />

      <Button
        variant="ghost"
        size="icon"
        className="size-7 justify-self-end"
        onClick={() => selectTask(task.id)}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}
