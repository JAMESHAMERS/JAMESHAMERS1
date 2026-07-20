"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ListTodoIcon } from "lucide-react";

import type { TaskSummary } from "../../domain/types";
import { WidgetCard } from "@/shared/components/composed/widget-card";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

const priorityVariant = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
} as const;

export function TodayTasksCard({ tasks }: { tasks: TaskSummary[] }) {
  const t = useTranslations("dashboard");
  // Local-only toggle state: no persistence layer for tasks yet (see
  // docs/ROADMAP.md Phase 2) — this demonstrates the interaction, not a
  // real feature.
  const [done, setDone] = useState(() =>
    Object.fromEntries(tasks.map((task) => [task.id, task.done])),
  );

  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <WidgetCard
      title={t("widgets.todayTasks.title")}
      icon={ListTodoIcon}
      action={{ href: "/tasks", label: t("widgets.todayTasks.viewAll") }}
    >
      {tasks.length === 0 ? (
        <EmptyState title={t("widgets.todayTasks.empty")} />
      ) : (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2.5">
                <Checkbox
                  checked={done[task.id]}
                  onCheckedChange={(checked) =>
                    setDone((prev) => ({ ...prev, [task.id]: checked === true }))
                  }
                  aria-label={t(`demo.tasks.${task.titleKey}`)}
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    done[task.id] && "text-muted-foreground line-through",
                  )}
                >
                  {t(`demo.tasks.${task.titleKey}`)}
                </span>
                {task.priority === "high" && !done[task.id] ? (
                  <Badge variant={priorityVariant[task.priority]} className="text-[10px]">
                    {t(`widgets.todayTasks.priority.${task.priority}`)}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground border-t pt-3 text-xs tabular-nums">
            {t("widgets.todayTasks.completed", { done: doneCount, total: tasks.length })}
          </p>
        </div>
      )}
    </WidgetCard>
  );
}
