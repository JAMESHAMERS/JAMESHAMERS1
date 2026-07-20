"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { TASK_STATUSES } from "../../domain/types";
import { filterTasks, groupByStatus } from "../../domain/rules";
import { useTaskStore } from "../../application/task-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { EmptyState } from "@/shared/components/composed/empty-state";
import { STATUS_META } from "../task-meta";
import { cn } from "@/shared/lib/utils";
import { TaskRow } from "../components/task-row";

const PRIORITY_WEIGHT = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
type SortKey = "manual" | "priority" | "dueDate" | "created";

export function ListView() {
  const t = useTranslations("tasks");
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const [sortKey, setSortKey] = useState<SortKey>("manual");

  const grouped = useMemo(() => {
    const visible = filterTasks(tasks, filters);
    const groups = groupByStatus(visible);

    if (sortKey === "priority") {
      for (const status of TASK_STATUSES) {
        groups[status] = [...groups[status]].sort(
          (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
        );
      }
    } else if (sortKey === "dueDate") {
      for (const status of TASK_STATUSES) {
        groups[status] = [...groups[status]].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
      }
    } else if (sortKey === "created") {
      for (const status of TASK_STATUSES) {
        groups[status] = [...groups[status]].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    }

    return groups;
  }, [tasks, filters, sortKey]);

  const total = TASK_STATUSES.reduce((sum, status) => sum + grouped[status].length, 0);

  if (total === 0) {
    return <EmptyState title={t("list.empty")} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">{t("list.sort.manual")}</SelectItem>
            <SelectItem value="priority">{t("list.sort.priority")}</SelectItem>
            <SelectItem value="dueDate">{t("list.sort.dueDate")}</SelectItem>
            <SelectItem value="created">{t("list.sort.created")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-6">
        {TASK_STATUSES.map((status) => {
          const rows = grouped[status];
          if (rows.length === 0) return null;
          const { dotClassName } = STATUS_META[status];

          return (
            <section key={status}>
              <div className="mb-2 flex items-center gap-2 px-1 text-sm font-medium">
                <span className={cn("size-2 rounded-full", dotClassName)} />
                {t(`status.${status}`)}
                <span className="text-muted-foreground font-normal tabular-nums">{rows.length}</span>
              </div>
              <div className="overflow-hidden rounded-lg border">
                {rows.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
