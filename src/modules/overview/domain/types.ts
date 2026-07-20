/**
 * The overview dashboard aggregates a slice of every other module (tasks,
 * habits, finance, goals). Those modules don't exist as real domains yet
 * (see docs/ROADMAP.md), so these types are intentionally minimal —
 * exactly the shape the widgets need to render, not a full domain model.
 * Once a module (e.g. Tasks) is built for real, its own richer `domain`
 * type becomes the source of truth and this shrinks to a view-model
 * derived from it.
 */

export type Priority = "low" | "medium" | "high";

export interface TaskSummary {
  id: string;
  titleKey: string;
  done: boolean;
  priority: Priority;
}

export interface GoalSummary {
  id: string;
  titleKey: string;
  progress: number;
  categoryKey: string;
}

export type ActivityKind = "task" | "habit" | "finance" | "journal";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  messageKey: string;
  messageValues?: Record<string, string | number>;
  minutesAgo: number;
}

export interface FinanceDayPoint {
  dayKey: string;
  income: number;
  expense: number;
}

export interface FinanceSummary {
  income: number;
  expense: number;
  balance: number;
  currency: string;
  trend: FinanceDayPoint[];
}

export interface ProductivityScore {
  score: number;
  tasksCompleted: number;
  tasksTotal: number;
  streakDays: number;
}

export interface OverviewData {
  tasksToday: TaskSummary[];
  goals: GoalSummary[];
  activity: ActivityItem[];
  finance: FinanceSummary;
  productivity: ProductivityScore;
  markedDates: string[];
}
