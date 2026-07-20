"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { Task } from "../../domain/types";
import { filterTasks } from "../../domain/rules";
import { useTaskStore } from "../../application/task-store";
import { getMonthGrid, getWeekdayLabels, toDateKey } from "@/shared/lib/date-grid";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { PRIORITY_META } from "../task-meta";

const MAX_VISIBLE_PER_DAY = 3;

export function CalendarView() {
  const t = useTranslations("tasks");
  const locale = useLocale();
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);
  const selectTask = useTaskStore((s) => s.selectTask);

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const visible = filterTasks(tasks, filters);
  const days = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale, "short"), [locale]);
  const todayKey = toDateKey(today);

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of visible) {
      if (!task.dueDate) continue;
      const key = toDateKey(new Date(`${task.dueDate}T00:00:00`));
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    return map;
  }, [visible]);

  const unscheduled = visible.filter((task) => !task.dueDate);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
          >
            {t("calendar.today")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="text-muted-foreground grid grid-cols-7 border-b text-center text-xs font-medium">
          {weekdayLabels.map((label, i) => (
            <div key={i} className="border-r py-2 uppercase last:border-r-0">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date) => {
            const key = toDateKey(date);
            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
            const isToday = key === todayKey;
            const dayTasks = byDate.get(key) ?? [];
            const overflow = dayTasks.length - MAX_VISIBLE_PER_DAY;

            return (
              <div
                key={key}
                className={cn(
                  "min-h-24 border-r border-b p-1.5 last:border-r-0 sm:min-h-28",
                  !isCurrentMonth && "bg-muted/30",
                )}
              >
                <span
                  className={cn(
                    "mb-1 inline-flex size-5 items-center justify-center rounded-full text-xs tabular-nums",
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                    isToday && "bg-primary text-primary-foreground font-medium",
                  )}
                >
                  {date.getDate()}
                </span>
                {/* Below `sm`, cells are too narrow for readable truncated
                    titles (single letters), so mobile shows dot indicators
                    only — tap the day's tasks via the sm+ view, or open one
                    directly from the "no due date" list. Native calendar
                    apps make the same trade-off at this cell width. */}
                <div className="flex flex-wrap gap-1 sm:hidden">
                  {dayTasks.slice(0, 6).map((task) => {
                    const { className: priorityClassName } = PRIORITY_META[task.priority];
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => selectTask(task.id)}
                        aria-label={task.title}
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          priorityClassName.replace("text-", "bg-"),
                          task.status === "done" && "opacity-40",
                        )}
                      />
                    );
                  })}
                </div>

                <div className="hidden flex-col gap-1 sm:flex">
                  {dayTasks.slice(0, MAX_VISIBLE_PER_DAY).map((task) => {
                    const { className: priorityClassName } = PRIORITY_META[task.priority];
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => selectTask(task.id)}
                        className={cn(
                          "bg-accent/60 hover:bg-accent flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] transition-colors",
                          task.status === "done" && "text-muted-foreground line-through",
                        )}
                      >
                        <span className={cn("size-1.5 shrink-0 rounded-full", priorityClassName.replace("text-", "bg-"))} />
                        <span className="truncate">{task.title}</span>
                      </button>
                    );
                  })}
                  {overflow > 0 ? (
                    <span className="text-muted-foreground px-1.5 text-[11px]">
                      {t("calendar.more", { count: overflow })}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {unscheduled.length > 0 ? (
        <div>
          <p className="text-muted-foreground mb-2 px-1 text-xs font-medium">
            {t("calendar.noDueDate")}
          </p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => selectTask(task.id)}
                className="bg-accent/60 hover:bg-accent rounded-full px-2.5 py-1 text-xs transition-colors"
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
