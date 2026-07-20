export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export interface MealEntry {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  /** Grams. */
  protein: number;
  /** Grams. */
  carbs: number;
  /** Grams. */
  fat: number;
  /** ISO datetime — which day it belongs to is derived from this, not a separate date field. */
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterEntry {
  id: string;
  /** Milliliters. */
  amountMl: number;
  loggedAt: string;
  createdAt: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
  waterMl: 2000,
};

/** Quick-add amounts for the water tracker (ml). */
export const WATER_QUICK_ADD = [250, 330, 500];
