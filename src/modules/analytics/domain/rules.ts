import type { Task, TaskPriority, TaskStatus } from "@/modules/tasks/domain/types";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/modules/tasks/domain/types";

/**
 * Pure business rules — no framework, no I/O, trivially unit-testable.
 *
 * This is the one piece of genuinely new aggregation logic Analytics needs
 * (Tasks' own `domain/rules.ts` has no notion of status/priority breakdowns
 * or a completion trend, since Tasks itself never needed one). Everywhere
 * else — Finance, Meals, Travel, Journal — Analytics reuses each sibling
 * module's own pure `domain/rules.ts` functions directly from its tab
 * components instead of re-deriving the same math here. See
 * `src/modules/analytics/README.md` for why importing sibling `domain`
 * (types + pure rules) and `infrastructure` (read-only repositories) is a
 * deliberate, scoped exception to "modules never import each other."
 */

export interface CategoryTotal<T extends string> {
  category: T;
  total: number;
}

export function taskStatusBreakdown(tasks: Task[]): CategoryTotal<TaskStatus>[] {
  return TASK_STATUSES.map((status) => ({
    category: status,
    total: tasks.filter((t) => t.status === status).length,
  }));
}

export function taskPriorityBreakdown(tasks: Task[]): CategoryTotal<TaskPriority>[] {
  return TASK_PRIORITIES.map((priority) => ({
    category: priority,
    total: tasks.filter((t) => t.priority === priority).length,
  }));
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Oldest-first array of Monday `Date`s for the last `count` weeks, including the current one. */
export function lastWeeks(count: number, from: Date = new Date()) {
  const currentWeekStart = startOfWeek(from);
  return Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i;
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - offset * 7);
    return d;
  });
}

export interface WeeklyCompletionPoint {
  weekStart: Date;
  count: number;
}

export function weeklyCompletionTrend(tasks: Task[], weeks: Date[]): WeeklyCompletionPoint[] {
  return weeks.map((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = tasks.filter((t) => {
      if (!t.completedAt) return false;
      const completed = new Date(t.completedAt);
      return completed >= weekStart && completed < weekEnd;
    }).length;
    return { weekStart, count };
  });
}

export interface ProductivityStats {
  total: number;
  completed: number;
  completionRate: number;
  overdue: number;
}

export function productivityStats(tasks: Task[], now: Date = new Date()): ProductivityStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== "done" && new Date(`${t.dueDate}T23:59:59`) < now,
  ).length;
  return { total, completed, completionRate: total === 0 ? 0 : Math.round((completed / total) * 100), overdue };
}
