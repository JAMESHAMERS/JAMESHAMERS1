import type { MealEntry, MealType, NutritionGoals, WaterEntry } from "./types";

export interface CreateMealEntryInput {
  mealType: MealType;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt?: string;
}

export interface UpdateMealEntryInput {
  mealType?: MealType;
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt?: string;
}

export interface CreateWaterEntryInput {
  amountMl: number;
  loggedAt?: string;
}

export type UpdateGoalsInput = Partial<NutritionGoals>;

/**
 * Storage-agnostic contract for everything the Meals module needs to
 * persist. `LocalMealsRepository` (active today, browser-only) and
 * `SupabaseMealsRepository` (production adapter, wired in once auth
 * exists — see docs/ROADMAP.md) both implement this exactly, so
 * `application` and `presentation` never know which one is behind it.
 */
export interface MealsRepository {
  listMealEntries(): Promise<MealEntry[]>;
  listWaterEntries(): Promise<WaterEntry[]>;
  getGoals(): Promise<NutritionGoals>;

  createMealEntry(input: CreateMealEntryInput): Promise<MealEntry>;
  updateMealEntry(entryId: string, input: UpdateMealEntryInput): Promise<MealEntry>;
  deleteMealEntry(entryId: string): Promise<void>;

  createWaterEntry(input: CreateWaterEntryInput): Promise<WaterEntry>;
  deleteWaterEntry(entryId: string): Promise<void>;

  updateGoals(input: UpdateGoalsInput): Promise<NutritionGoals>;
}
