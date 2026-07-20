import { LocalTaskRepository } from "@/modules/tasks/infrastructure/local-task-repository";
import type { Task } from "@/modules/tasks/domain/types";

import { LocalFinanceRepository } from "@/modules/finance/infrastructure/local-finance-repository";
import type { Category as FinanceCategory, Transaction } from "@/modules/finance/domain/types";

import { LocalMealsRepository } from "@/modules/meals/infrastructure/local-meals-repository";
import type { MealEntry, NutritionGoals, WaterEntry } from "@/modules/meals/domain/types";

import { LocalTravelRepository } from "@/modules/travel/infrastructure/local-travel-repository";
import type { Trip, TripExpense } from "@/modules/travel/domain/types";

import { LocalJournalRepository } from "@/modules/journal/infrastructure/local-journal-repository";
import type { JournalEntry } from "@/modules/journal/domain/types";

export interface AnalyticsSources {
  tasks: Task[];
  transactions: Transaction[];
  financeCategories: FinanceCategory[];
  mealEntries: MealEntry[];
  waterEntries: WaterEntry[];
  mealGoals: NutritionGoals;
  trips: Trip[];
  tripExpenses: TripExpense[];
  journalEntries: JournalEntry[];
}

/**
 * Reads today's data straight from each sibling module's own
 * `Local<X>Repository` — the same `localStorage`-backed classes those
 * modules' own Zustand stores use — rather than depending on those
 * stores being hydrated (a user landing on /analytics may never have
 * opened /tasks or /finance this session). Each repository seeds itself
 * on first construction, same as everywhere else it's used.
 *
 * Must only run client-side (every repository touches `localStorage` in
 * its constructor); `application/analytics-store.ts` only calls this from
 * a post-mount `hydrate()`, never at module scope. See
 * `src/modules/analytics/README.md` for why reading sibling
 * `infrastructure` (never `application`/`presentation`) is in bounds here.
 */
export async function loadAnalyticsSources(): Promise<AnalyticsSources> {
  const taskRepo = new LocalTaskRepository();
  const financeRepo = new LocalFinanceRepository();
  const mealsRepo = new LocalMealsRepository();
  const travelRepo = new LocalTravelRepository();
  const journalRepo = new LocalJournalRepository();

  const [
    tasks,
    transactions,
    financeCategories,
    mealEntries,
    waterEntries,
    mealGoals,
    trips,
    tripExpenses,
    journalEntries,
  ] = await Promise.all([
    taskRepo.listTasks(),
    financeRepo.listTransactions(),
    financeRepo.listCategories(),
    mealsRepo.listMealEntries(),
    mealsRepo.listWaterEntries(),
    mealsRepo.getGoals(),
    travelRepo.listTrips(),
    travelRepo.listExpenses(),
    journalRepo.listEntries(),
  ]);

  return {
    tasks,
    transactions,
    financeCategories,
    mealEntries,
    waterEntries,
    mealGoals,
    trips,
    tripExpenses,
    journalEntries,
  };
}
