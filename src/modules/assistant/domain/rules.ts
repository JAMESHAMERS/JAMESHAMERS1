import type { Task, TaskPriority } from "@/modules/tasks/domain/types";
import { isOverdue } from "@/modules/tasks/domain/rules";
import type { Category as FinanceCategory, Transaction } from "@/modules/finance/domain/types";
import { categoryBreakdown, getMonthKey, monthKeyOf, sumByType } from "@/modules/finance/domain/rules";
import type { JournalEntry } from "@/modules/journal/domain/types";
import { averageMoodScore, dayKeyOf, journalingStreak, lastDays as journalLastDays } from "@/modules/journal/domain/rules";
import type { MealEntry, NutritionGoals, WaterEntry } from "@/modules/meals/domain/types";
import { summarizeDay } from "@/modules/meals/domain/rules";
import type { Trip } from "@/modules/travel/domain/types";
import { dateKeyOf, tripStatus } from "@/modules/travel/domain/rules";

import type { AssistantToolName } from "./types";

/**
 * Pure aggregation + intent-matching for the Assistant — the same
 * "reuse a sibling module's own `domain/rules.ts` functions" pattern
 * Analytics established (see `src/modules/analytics/README.md`), extended
 * here because answering "what should I do today" needs the exact same
 * category of read access Analytics already has: sibling `domain` +
 * `infrastructure`, never `application`/`presentation`. Documented in
 * `docs/ARCHITECTURE.md` and `src/modules/assistant/README.md`.
 */

export interface AssistantSources {
  tasks: Task[];
  transactions: Transaction[];
  financeCategories: FinanceCategory[];
  mealEntries: MealEntry[];
  waterEntries: WaterEntry[];
  mealGoals: NutritionGoals;
  journalEntries: JournalEntry[];
  trips: Trip[];
}

const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 3, high: 2, medium: 1, low: 0 };

function todayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export interface TasksTodaySummary {
  dueTodayCount: number;
  overdueCount: number;
  inProgressCount: number;
  topTask: { title: string; priority: TaskPriority } | null;
}

export function summarizeTasksToday(tasks: Task[], now: Date = new Date()): TasksTodaySummary {
  const today = todayKey(now);
  const open = tasks.filter((t) => t.status !== "done");
  const dueToday = open.filter((t) => t.dueDate === today);
  const overdue = open.filter((t) => isOverdue(t, now));
  const inProgress = tasks.filter((t) => t.status === "in_progress" || t.status === "in_review");

  const candidates = [...overdue, ...dueToday.filter((t) => !overdue.includes(t))];
  const top = [...candidates].sort((a, b) => {
    const rankDiff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    if (rankDiff !== 0) return rankDiff;
    return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
  })[0];

  return {
    dueTodayCount: dueToday.length,
    overdueCount: overdue.length,
    inProgressCount: inProgress.length,
    topTask: top ? { title: top.title, priority: top.priority } : null,
  };
}

export interface FinanceMonthSummary {
  income: number;
  expense: number;
  net: number;
  topCategory: { name: string; total: number } | null;
}

export function summarizeFinanceMonth(
  transactions: Transaction[],
  categories: FinanceCategory[],
  now: Date = new Date(),
): FinanceMonthSummary {
  const key = monthKeyOf(now);
  const inMonth = transactions.filter((t) => getMonthKey(t.occurredAt) === key);
  const income = sumByType(inMonth, "income");
  const expense = sumByType(inMonth, "expense");
  const breakdown = categoryBreakdown(inMonth, "expense");
  const top = breakdown[0];
  const topCategory = top
    ? {
        name: categories.find((c) => c.id === top.categoryId)?.name ?? "Uncategorized",
        total: top.total,
      }
    : null;

  return { income, expense, net: income - expense, topCategory };
}

export interface GoalsStatusSummary {
  /** Always false today — the Goals module has no data model yet (see docs/ROADMAP.md Phase 4). */
  trackingAvailable: boolean;
}

export function summarizeGoalsStatus(): GoalsStatusSummary {
  return { trackingAvailable: false };
}

export interface JournalMoodSummary {
  streak: number;
  averageMoodScore: number | null;
  entriesCount: number;
}

export function summarizeJournalMood(entries: JournalEntry[], now: Date = new Date()): JournalMoodSummary {
  const days = journalLastDays(14, now);
  const startKey = dayKeyOf(days[0]);
  const recent = entries.filter((e) => e.entryDate >= startKey);
  return {
    streak: journalingStreak(entries, now),
    averageMoodScore: averageMoodScore(recent),
    entriesCount: recent.length,
  };
}

export interface MealsTodaySummary {
  calories: number;
  calorieGoal: number;
  waterMl: number;
  waterGoalMl: number;
}

export function summarizeMealsToday(
  mealEntries: MealEntry[],
  waterEntries: WaterEntry[],
  goals: NutritionGoals,
  now: Date = new Date(),
): MealsTodaySummary {
  const day = summarizeDay(mealEntries, waterEntries, now);
  return { calories: day.calories, calorieGoal: goals.calories, waterMl: day.waterMl, waterGoalMl: goals.waterMl };
}

export interface TravelUpcomingSummary {
  current: { name: string; destination: string; daysRemaining: number } | null;
  next: { name: string; destination: string; daysUntil: number } | null;
}

export function summarizeTravelUpcoming(trips: Trip[], now: Date = new Date()): TravelUpcomingSummary {
  const today = dateKeyOf(now);
  const ongoing = trips.find((t) => tripStatus(t, now) === "ongoing");
  const upcoming = trips
    .filter((t) => tripStatus(t, now) === "upcoming")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  const current = ongoing
    ? {
        name: ongoing.name,
        destination: ongoing.destination,
        daysRemaining: Math.max(
          0,
          Math.round((new Date(ongoing.endDate).getTime() - new Date(today).getTime()) / 86_400_000),
        ),
      }
    : null;
  const next = upcoming
    ? {
        name: upcoming.name,
        destination: upcoming.destination,
        daysUntil: Math.round((new Date(upcoming.startDate).getTime() - new Date(today).getTime()) / 86_400_000),
      }
    : null;

  return { current, next };
}

export interface AssistantContextSnapshot {
  get_tasks_today: TasksTodaySummary;
  get_finance_month_summary: FinanceMonthSummary;
  get_goals_status: GoalsStatusSummary;
  get_journal_mood: JournalMoodSummary;
  get_meals_today: MealsTodaySummary;
  get_travel_upcoming: TravelUpcomingSummary;
}

/** Runs every tool once up front — cheap (all local reads), and lets both the local engine and the API path share one snapshot instead of recomputing per question. */
export function buildContextSnapshot(sources: AssistantSources, now: Date = new Date()): AssistantContextSnapshot {
  return {
    get_tasks_today: summarizeTasksToday(sources.tasks, now),
    get_finance_month_summary: summarizeFinanceMonth(sources.transactions, sources.financeCategories, now),
    get_goals_status: summarizeGoalsStatus(),
    get_journal_mood: summarizeJournalMood(sources.journalEntries, now),
    get_meals_today: summarizeMealsToday(sources.mealEntries, sources.waterEntries, sources.mealGoals, now),
    get_travel_upcoming: summarizeTravelUpcoming(sources.trips, now),
  };
}

const INTENT_KEYWORDS: Record<AssistantToolName, string[]> = {
  get_tasks_today: ["today", "task", "todo", "overdue", "do today", "hôm nay", "việc", "làm gì", "công việc"],
  get_finance_month_summary: ["spend", "spent", "money", "budget", "expense", "finance", "cost", "chi tiêu", "tiền", "ngân sách", "chi phí"],
  get_goals_status: ["goal", "behind schedule", "mục tiêu"],
  get_journal_mood: ["mood", "feel", "feeling", "journal", "tâm trạng", "nhật ký", "cảm xúc"],
  get_meals_today: ["eat", "ate", "food", "calorie", "meal", "hydrat", "water", "ăn", "calo", "nước", "bữa"],
  get_travel_upcoming: ["trip", "travel", "vacation", "flight", "du lịch", "chuyến đi", "chuyến"],
};

/** Keyword match across every tool's trigger words (English + Vietnamese); falls back to a general daily-brief pairing when nothing matches. */
export function matchIntent(question: string): AssistantToolName[] {
  const q = question.toLowerCase();
  const matched = (Object.keys(INTENT_KEYWORDS) as AssistantToolName[]).filter((tool) =>
    INTENT_KEYWORDS[tool].some((kw) => q.includes(kw)),
  );
  return matched.length > 0 ? matched : ["get_tasks_today", "get_finance_month_summary"];
}

export type LocalAnswerTranslator = (key: string, values?: Record<string, string | number>) => string;
/** Plain callback, not an import — keeps this module free of any `shared/lib` dependency, same as every other module's `domain` layer. */
export type CurrencyFormatter = (amount: number) => string;

interface LocalAnswerResult {
  text: string;
  toolsUsed: AssistantToolName[];
}

/**
 * Builds a deterministic, template-based answer from an already-computed
 * snapshot — the no-API-key path, and the safety net if the real API
 * path errors mid-conversation. `t` and `formatCurrency` are plain
 * functions (matching next-intl's translator shape and
 * `shared/lib/format.ts#formatCurrency` respectively) passed in rather
 * than imported, so this stays a pure function callers can unit test
 * without React, next-intl, or a locale.
 */
export function localAnswer(
  question: string,
  snapshot: AssistantContextSnapshot,
  t: LocalAnswerTranslator,
  formatCurrency: CurrencyFormatter,
): LocalAnswerResult {
  const tools = matchIntent(question);
  const sentences = tools.map((tool) => describeTool(tool, snapshot, t, formatCurrency));
  return { text: sentences.join(" "), toolsUsed: tools };
}

function describeTool(
  tool: AssistantToolName,
  snapshot: AssistantContextSnapshot,
  t: LocalAnswerTranslator,
  formatCurrency: CurrencyFormatter,
): string {
  switch (tool) {
    case "get_tasks_today": {
      const s = snapshot.get_tasks_today;
      if (s.dueTodayCount === 0 && s.overdueCount === 0) return t("local.tasksToday.none");
      return t("local.tasksToday.some", {
        dueTodayCount: s.dueTodayCount,
        overdueCount: s.overdueCount,
        topTitle: s.topTask?.title ?? "",
      });
    }
    case "get_finance_month_summary": {
      const s = snapshot.get_finance_month_summary;
      if (s.topCategory) {
        return t("local.finance.withCategory", {
          expense: formatCurrency(s.expense),
          categoryName: s.topCategory.name,
          categoryTotal: formatCurrency(s.topCategory.total),
        });
      }
      return t("local.finance.noExpenses", { income: formatCurrency(s.income) });
    }
    case "get_goals_status":
      return t("local.goals.unavailable");
    case "get_journal_mood": {
      const s = snapshot.get_journal_mood;
      if (s.averageMoodScore === null) return t("local.mood.none");
      return t("local.mood.some", {
        streak: s.streak,
        averageMoodScore: s.averageMoodScore.toFixed(1),
      });
    }
    case "get_meals_today": {
      const s = snapshot.get_meals_today;
      return t("local.meals.summary", {
        calories: s.calories,
        calorieGoal: s.calorieGoal,
        waterMl: s.waterMl,
        waterGoalMl: s.waterGoalMl,
      });
    }
    case "get_travel_upcoming": {
      const s = snapshot.get_travel_upcoming;
      if (s.current) return t("local.travel.ongoing", { name: s.current.name, daysRemaining: s.current.daysRemaining });
      if (s.next) return t("local.travel.upcoming", { name: s.next.name, daysUntil: s.next.daysUntil });
      return t("local.travel.none");
    }
  }
}
