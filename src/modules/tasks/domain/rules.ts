import type { Task, TaskFilters, TaskStatus } from "./types";
import { TASK_STATUSES } from "./types";

/** Pure business rules — no framework, no I/O, trivially unit-testable. */

export function subtaskProgress(task: Task) {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function isOverdue(task: Task, now: Date = new Date()) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(`${task.dueDate}T23:59:59`) < now;
}

export function isDueSoon(task: Task, now: Date = new Date(), withinHours = 24) {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(`${task.dueDate}T23:59:59`);
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= withinHours;
}

export function sortByPosition(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.position - b.position);
}

export function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups = Object.fromEntries(
    TASK_STATUSES.map((status) => [status, [] as Task[]]),
  ) as Record<TaskStatus, Task[]>;

  for (const task of sortByPosition(tasks)) {
    groups[task.status].push(task);
  }
  return groups;
}

export function matchesFilters(task: Task, filters: TaskFilters) {
  const search = filters.search.trim().toLowerCase();
  if (search && !task.title.toLowerCase().includes(search)) return false;
  if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false;
  if (
    filters.labelIds.length &&
    !filters.labelIds.some((id) => task.labelIds.includes(id))
  ) {
    return false;
  }
  return true;
}

export function filterTasks(tasks: Task[], filters: TaskFilters) {
  return tasks.filter((task) => matchesFilters(task, filters));
}

export function nextPosition(tasks: Task[], status: TaskStatus) {
  const inStatus = tasks.filter((t) => t.status === status);
  return inStatus.length === 0 ? 0 : Math.max(...inStatus.map((t) => t.position)) + 1;
}
