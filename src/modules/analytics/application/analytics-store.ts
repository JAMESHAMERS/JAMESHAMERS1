import { create } from "zustand";

import type { Task } from "@/modules/tasks/domain/types";
import type { Category as FinanceCategory, Transaction } from "@/modules/finance/domain/types";
import type { MealEntry, NutritionGoals, WaterEntry } from "@/modules/meals/domain/types";
import { DEFAULT_GOALS } from "@/modules/meals/domain/types";
import type { Trip, TripExpense } from "@/modules/travel/domain/types";
import type { JournalEntry } from "@/modules/journal/domain/types";

import type { AnalyticsTab } from "../domain/types";
import { loadAnalyticsSources } from "../infrastructure/read-sources";

interface AnalyticsStoreState {
  tab: AnalyticsTab;
  hydrated: boolean;

  tasks: Task[];
  transactions: Transaction[];
  financeCategories: FinanceCategory[];
  mealEntries: MealEntry[];
  waterEntries: WaterEntry[];
  mealGoals: NutritionGoals;
  trips: Trip[];
  tripExpenses: TripExpense[];
  journalEntries: JournalEntry[];

  hydrate: () => Promise<void>;
  setTab: (tab: AnalyticsTab) => void;
}

/**
 * The "application" layer for the Analytics module — unlike every other
 * module's store, this one has no create/update/delete actions, only a
 * read: `hydrate()` pulls a point-in-time snapshot from five sibling
 * modules' repositories (see `infrastructure/read-sources.ts`) and holds
 * it for the dashboards to chart. There's nothing here for `presentation`
 * to write back — Analytics never mutates another module's data.
 */
export const useAnalyticsStore = create<AnalyticsStoreState>((set, get) => ({
  tab: "productivity",
  hydrated: false,

  tasks: [],
  transactions: [],
  financeCategories: [],
  mealEntries: [],
  waterEntries: [],
  mealGoals: DEFAULT_GOALS,
  trips: [],
  tripExpenses: [],
  journalEntries: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const sources = await loadAnalyticsSources();
    set({ ...sources, hydrated: true });
  },

  setTab: (tab) => set({ tab }),
}));
