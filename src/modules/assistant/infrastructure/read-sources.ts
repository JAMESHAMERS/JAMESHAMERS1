import { LocalTaskRepository } from "@/modules/tasks/infrastructure/local-task-repository";
import { LocalFinanceRepository } from "@/modules/finance/infrastructure/local-finance-repository";
import { LocalMealsRepository } from "@/modules/meals/infrastructure/local-meals-repository";
import { LocalJournalRepository } from "@/modules/journal/infrastructure/local-journal-repository";
import { LocalTravelRepository } from "@/modules/travel/infrastructure/local-travel-repository";

import type { AssistantSources } from "../domain/rules";

/**
 * Reads a point-in-time snapshot straight from each sibling module's own
 * `Local<X>Repository` — the same pattern (and the same reasoning) as
 * `src/modules/analytics/infrastructure/read-sources.ts`. Must only run
 * client-side (every repository touches `localStorage` in its
 * constructor); `application/assistant-store.ts` only calls this from a
 * post-mount `hydrate()`. No Goals/Habits repositories exist yet — the
 * Assistant answers those questions honestly instead (see
 * `domain/rules.ts` → `summarizeGoalsStatus`).
 */
export async function loadAssistantSources(): Promise<AssistantSources> {
  const taskRepo = new LocalTaskRepository();
  const financeRepo = new LocalFinanceRepository();
  const mealsRepo = new LocalMealsRepository();
  const journalRepo = new LocalJournalRepository();
  const travelRepo = new LocalTravelRepository();

  const [tasks, transactions, financeCategories, mealEntries, waterEntries, mealGoals, journalEntries, trips] =
    await Promise.all([
      taskRepo.listTasks(),
      financeRepo.listTransactions(),
      financeRepo.listCategories(),
      mealsRepo.listMealEntries(),
      mealsRepo.listWaterEntries(),
      mealsRepo.getGoals(),
      journalRepo.listEntries(),
      travelRepo.listTrips(),
    ]);

  return { tasks, transactions, financeCategories, mealEntries, waterEntries, mealGoals, journalEntries, trips };
}
