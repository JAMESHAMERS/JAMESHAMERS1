"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquareIcon, PaperclipIcon } from "lucide-react";

import type { Task } from "../../domain/types";
import { useTaskStore } from "../../application/task-store";
import { cn } from "@/shared/lib/utils";
import { PriorityIcon } from "./priority-icon";
import { LabelChip } from "./label-chip";
import { DueDateBadge } from "./due-date-badge";
import { SubtaskProgress } from "./subtask-progress";

export function TaskCard({ task }: { task: Task }) {
  const selectTask = useTaskStore((s) => s.selectTask);
  const labels = useTaskStore((s) => s.labels);
  const taskLabels = labels.filter((l) => task.labelIds.includes(l.id));

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => selectTask(task.id)}
      className={cn(
        "bg-card hover:border-foreground/20 cursor-grab space-y-2 rounded-lg border p-3 shadow-xs transition-colors active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug font-medium">{task.title}</p>
        <PriorityIcon priority={task.priority} className="mt-0.5 shrink-0" />
      </div>

      {taskLabels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {taskLabels.map((label) => (
            <LabelChip key={label.id} label={label} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
        <DueDateBadge task={task} />
        <SubtaskProgress task={task} />
        {task.comments.length > 0 ? (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <MessageSquareIcon className="size-3" />
            {task.comments.length}
          </span>
        ) : null}
        {task.attachments.length > 0 ? (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <PaperclipIcon className="size-3" />
            {task.attachments.length}
          </span>
        ) : null}
      </div>
    </div>
  );
}
