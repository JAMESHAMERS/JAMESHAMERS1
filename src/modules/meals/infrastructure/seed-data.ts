import type { MealEntry, MealType, WaterEntry } from "../domain/types";
import { WATER_QUICK_ADD } from "../domain/types";

// Small seeded PRNG (mulberry32) so seed data is reproducible across runs —
// useful for QA/screenshots — without pulling in a dependency for it.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MealTemplate {
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const BREAKFASTS: MealTemplate[] = [
  { mealType: "breakfast", name: "Oatmeal with banana", calories: 340, protein: 10, carbs: 62, fat: 6 },
  { mealType: "breakfast", name: "Eggs and toast", calories: 420, protein: 22, carbs: 34, fat: 20 },
  { mealType: "breakfast", name: "Greek yogurt with berries", calories: 260, protein: 18, carbs: 32, fat: 6 },
  { mealType: "breakfast", name: "Pho bo", calories: 480, protein: 26, carbs: 58, fat: 12 },
];

const LUNCHES: MealTemplate[] = [
  { mealType: "lunch", name: "Grilled chicken rice bowl", calories: 620, protein: 42, carbs: 68, fat: 16 },
  { mealType: "lunch", name: "Beef banh mi", calories: 540, protein: 28, carbs: 56, fat: 20 },
  { mealType: "lunch", name: "Salmon salad", calories: 480, protein: 34, carbs: 24, fat: 26 },
  { mealType: "lunch", name: "Com tam suon", calories: 700, protein: 32, carbs: 78, fat: 24 },
];

const DINNERS: MealTemplate[] = [
  { mealType: "dinner", name: "Stir-fried tofu and vegetables", calories: 460, protein: 22, carbs: 46, fat: 18 },
  { mealType: "dinner", name: "Grilled pork chop with rice", calories: 640, protein: 38, carbs: 60, fat: 24 },
  { mealType: "dinner", name: "Shrimp fried rice", calories: 560, protein: 26, carbs: 68, fat: 16 },
  { mealType: "dinner", name: "Chicken curry", calories: 580, protein: 30, carbs: 42, fat: 28 },
];

const SNACKS: MealTemplate[] = [
  { mealType: "snack", name: "Apple", calories: 95, protein: 0, carbs: 25, fat: 0 },
  { mealType: "snack", name: "Almonds (handful)", calories: 170, protein: 6, carbs: 6, fat: 15 },
  { mealType: "snack", name: "Protein shake", calories: 180, protein: 24, carbs: 8, fat: 4 },
  { mealType: "snack", name: "Granola bar", calories: 150, protein: 4, carbs: 22, fat: 6 },
];

function pick<T>(arr: T[], rand: () => number) {
  return arr[Math.floor(rand() * arr.length)];
}

function isoAt(base: Date, dayOffset: number, hour: number, minute: number) {
  const d = new Date(base);
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * Deterministic ~6 days of realistic meal + water history so the Today and
 * Weekly tabs both have something meaningful to render on first visit —
 * not just an empty state.
 */
export function createSeedData(): { mealEntries: MealEntry[]; waterEntries: WaterEntry[] } {
  const rand = mulberry32(20260720);
  const now = new Date();
  const mealEntries: MealEntry[] = [];
  const waterEntries: WaterEntry[] = [];
  let mealCounter = 0;
  let waterCounter = 0;

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const breakfast = pick(BREAKFASTS, rand);
    mealEntries.push({
      id: `seed-meal-${mealCounter++}`,
      ...breakfast,
      loggedAt: isoAt(now, dayOffset, 7, 30 + Math.floor(rand() * 30)),
      createdAt: isoAt(now, dayOffset, 7, 30),
      updatedAt: isoAt(now, dayOffset, 7, 30),
    });

    const lunch = pick(LUNCHES, rand);
    mealEntries.push({
      id: `seed-meal-${mealCounter++}`,
      ...lunch,
      loggedAt: isoAt(now, dayOffset, 12, Math.floor(rand() * 40)),
      createdAt: isoAt(now, dayOffset, 12, 0),
      updatedAt: isoAt(now, dayOffset, 12, 0),
    });

    const dinner = pick(DINNERS, rand);
    mealEntries.push({
      id: `seed-meal-${mealCounter++}`,
      ...dinner,
      loggedAt: isoAt(now, dayOffset, 19, Math.floor(rand() * 40)),
      createdAt: isoAt(now, dayOffset, 19, 0),
      updatedAt: isoAt(now, dayOffset, 19, 0),
    });

    if (rand() > 0.3) {
      const snack = pick(SNACKS, rand);
      mealEntries.push({
        id: `seed-meal-${mealCounter++}`,
        ...snack,
        loggedAt: isoAt(now, dayOffset, 15, Math.floor(rand() * 40)),
        createdAt: isoAt(now, dayOffset, 15, 0),
        updatedAt: isoAt(now, dayOffset, 15, 0),
      });
    }

    const glassCount = 4 + Math.floor(rand() * 4);
    for (let i = 0; i < glassCount; i++) {
      const amountMl = pick(WATER_QUICK_ADD, rand);
      const loggedAt = isoAt(now, dayOffset, 8 + i * 2, Math.floor(rand() * 60));
      waterEntries.push({
        id: `seed-water-${waterCounter++}`,
        amountMl,
        loggedAt,
        createdAt: loggedAt,
      });
    }
  }

  return { mealEntries, waterEntries };
}
