import { create } from "zustand";

import type {
  CreateMealEntryInput,
  CreateWaterEntryInput,
  MealsRepository,
  UpdateGoalsInput,
  UpdateMealEntryInput,
} from "../domain/repository";
import type { MealEntry, NutritionGoals, WaterEntry } from "../domain/types";
import { DEFAULT_GOALS } from "../domain/types";
import { LocalMealsRepository } from "../infrastructure/local-meals-repository";

export type MealsTab = "today" | "weekly";

interface MealsStoreState {
  repo: MealsRepository | null;
  mealEntries: MealEntry[];
  waterEntries: WaterEntry[];
  goals: NutritionGoals;
  tab: MealsTab;
  /** Midnight `Date` driving the Today tab's day navigator. */
  activeDay: Date;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setTab: (tab: MealsTab) => void;
  setActiveDay: (date: Date) => void;

  createMealEntry: (input: CreateMealEntryInput) => Promise<MealEntry>;
  updateMealEntry: (entryId: string, input: UpdateMealEntryInput) => Promise<void>;
  deleteMealEntry: (entryId: string) => Promise<void>;

  createWaterEntry: (input: CreateWaterEntryInput) => Promise<WaterEntry>;
  deleteWaterEntry: (entryId: string) => Promise<void>;

  updateGoals: (input: UpdateGoalsInput) => Promise<void>;
}

/**
 * The "application" layer for the Meals module, same shape as
 * `modules/finance/application/finance-store.ts`: each action is a thin
 * call into the injected `MealsRepository` followed by a local state patch.
 * `presentation` only ever calls these actions.
 */
export const useMealsStore = create<MealsStoreState>((set, get) => ({
  repo: null,
  mealEntries: [],
  waterEntries: [],
  goals: DEFAULT_GOALS,
  tab: "today",
  activeDay: new Date(new Date().setHours(0, 0, 0, 0)),
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    // Constructed here, not at module scope — see finance-store.ts for why.
    const repo = new LocalMealsRepository();
    const [mealEntries, waterEntries, goals] = await Promise.all([
      repo.listMealEntries(),
      repo.listWaterEntries(),
      repo.getGoals(),
    ]);
    set({ repo, mealEntries, waterEntries, goals, hydrated: true });
  },

  setTab: (tab) => set({ tab }),
  setActiveDay: (date) => set({ activeDay: date }),

  createMealEntry: async (input) => {
    const entry = await get().repo!.createMealEntry(input);
    set((s) => ({ mealEntries: [...s.mealEntries, entry] }));
    return entry;
  },

  updateMealEntry: async (entryId, input) => {
    const updated = await get().repo!.updateMealEntry(entryId, input);
    set((s) => ({ mealEntries: s.mealEntries.map((e) => (e.id === entryId ? updated : e)) }));
  },

  deleteMealEntry: async (entryId) => {
    await get().repo!.deleteMealEntry(entryId);
    set((s) => ({ mealEntries: s.mealEntries.filter((e) => e.id !== entryId) }));
  },

  createWaterEntry: async (input) => {
    const entry = await get().repo!.createWaterEntry(input);
    set((s) => ({ waterEntries: [...s.waterEntries, entry] }));
    return entry;
  },

  deleteWaterEntry: async (entryId) => {
    await get().repo!.deleteWaterEntry(entryId);
    set((s) => ({ waterEntries: s.waterEntries.filter((e) => e.id !== entryId) }));
  },

  updateGoals: async (input) => {
    const goals = await get().repo!.updateGoals(input);
    set({ goals });
  },
}));
