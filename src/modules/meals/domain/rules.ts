import type { MealEntry, MealType, NutritionGoals, WaterEntry } from "./types";
import { MEAL_TYPES } from "./types";

/** Pure business rules — no framework, no I/O, trivially unit-testable. */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toDayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayKeyOf(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Oldest-first array of `Date` for the last `count` days, including `from`. */
export function lastDays(count: number, from: Date = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i;
    const d = new Date(from);
    d.setDate(d.getDate() - offset);
    return d;
  });
}

export function entriesForDay(entries: MealEntry[], dayKey: string) {
  return entries.filter((e) => toDayKey(e.loggedAt) === dayKey);
}

export function waterForDay(entries: WaterEntry[], dayKey: string) {
  return entries.filter((e) => toDayKey(e.loggedAt) === dayKey);
}

export function groupByMealType(entries: MealEntry[]): Record<MealType, MealEntry[]> {
  const groups = Object.fromEntries(MEAL_TYPES.map((type) => [type, [] as MealEntry[]])) as Record<
    MealType,
    MealEntry[]
  >;
  for (const entry of entries) {
    groups[entry.mealType].push(entry);
  }
  return groups;
}

export function sumCalories(entries: MealEntry[]) {
  return entries.reduce((sum, e) => sum + e.calories, 0);
}

export interface MacroTotals {
  protein: number;
  carbs: number;
  fat: number;
}

export function sumMacros(entries: MealEntry[]): MacroTotals {
  return entries.reduce(
    (totals, e) => ({
      protein: totals.protein + e.protein,
      carbs: totals.carbs + e.carbs,
      fat: totals.fat + e.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
}

export function sumWater(entries: WaterEntry[]) {
  return entries.reduce((sum, e) => sum + e.amountMl, 0);
}

/** Calories contributed by each macro (protein/carbs = 4 kcal/g, fat = 9 kcal/g). */
export function macroCalories(macros: MacroTotals) {
  return { protein: macros.protein * 4, carbs: macros.carbs * 4, fat: macros.fat * 9 };
}

export interface DaySummary {
  dayKey: string;
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export function summarizeDay(mealEntries: MealEntry[], waterEntries: WaterEntry[], date: Date): DaySummary {
  const dayKey = dayKeyOf(date);
  const dayMeals = entriesForDay(mealEntries, dayKey);
  const macros = sumMacros(dayMeals);
  return {
    dayKey,
    date,
    calories: sumCalories(dayMeals),
    ...macros,
    waterMl: sumWater(waterForDay(waterEntries, dayKey)),
  };
}

export function dailySummaries(mealEntries: MealEntry[], waterEntries: WaterEntry[], days: Date[]): DaySummary[] {
  return days.map((date) => summarizeDay(mealEntries, waterEntries, date));
}

export interface DayAverages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export function averageOf(summaries: DaySummary[]): DayAverages {
  if (summaries.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 };
  const total = summaries.reduce(
    (acc, s) => ({
      calories: acc.calories + s.calories,
      protein: acc.protein + s.protein,
      carbs: acc.carbs + s.carbs,
      fat: acc.fat + s.fat,
      waterMl: acc.waterMl + s.waterMl,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 },
  );
  const n = summaries.length;
  return {
    calories: Math.round(total.calories / n),
    protein: Math.round(total.protein / n),
    carbs: Math.round(total.carbs / n),
    fat: Math.round(total.fat / n),
    waterMl: Math.round(total.waterMl / n),
  };
}

export function goalProgress(consumed: number, goal: number) {
  const percent = goal === 0 ? 0 : Math.round((consumed / goal) * 100);
  return { consumed, goal, percent: Math.min(100, Math.max(0, percent)), isOver: consumed > goal };
}

export function sortByLoggedAtDesc<T extends { loggedAt: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
}

export type { NutritionGoals };
