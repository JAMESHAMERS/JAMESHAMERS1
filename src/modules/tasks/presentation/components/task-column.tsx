"use client";

import { useTranslations } from "next-intl";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";

import type { Task, TaskStatus } from "../../domain/types";
import { STATUS_META } from "../task-meta";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { TaskCard } from "./task-card";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
}

export function TaskColumn({ status, tasks, onAddTask }: TaskColumnProps) {
  const t = useTranslations("tasks");
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  const { dotClassName } = STATUS_META[status];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("size-2 rounded-full", dotClassName)} />
          {t(`status.${status}`)}
          <span className="text-muted-foreground font-normal tabular-nums">{tasks.length}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => onAddTask(status)}
          aria-label={t("actions.addTask")}
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2 rounded-lg p-1 transition-colors",
          isOver && "bg-accent/60",
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center rounded-md border border-dashed py-8 text-center text-xs">
            {t("kanban.emptyColumn")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
