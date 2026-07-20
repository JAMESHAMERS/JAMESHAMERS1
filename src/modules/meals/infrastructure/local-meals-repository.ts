import type {
  CreateMealEntryInput,
  CreateWaterEntryInput,
  MealsRepository,
  UpdateGoalsInput,
  UpdateMealEntryInput,
} from "../domain/repository";
import type { MealEntry, NutritionGoals, WaterEntry } from "../domain/types";
import { DEFAULT_GOALS } from "../domain/types";
import { createSeedData } from "./seed-data";

const STORAGE_KEY = "lifeos:meals:v1";

interface StoredData {
  mealEntries: MealEntry[];
  waterEntries: WaterEntry[];
  goals: NutritionGoals;
}

function loadFromStorage(): StoredData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredData) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: StoredData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable (private browsing) — state still works
    // for the rest of the session, it just won't survive a reload.
  }
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function findMealEntry(data: StoredData, id: string): MealEntry {
  const entry = data.mealEntries.find((e) => e.id === id);
  if (!entry) throw new Error(`Meal entry not found: ${id}`);
  return entry;
}

/**
 * Browser `localStorage`-backed `MealsRepository`. Active until auth exists
 * (see docs/ROADMAP.md and src/modules/meals/README.md) — every method
 * still returns a Promise so swapping in `SupabaseMealsRepository` later
 * doesn't change any call site.
 *
 * Must only be constructed client-side (it touches `localStorage` in its
 * constructor); `application/meals-store.ts` only does so from a post-mount
 * effect, never at module scope, so it never runs during SSR.
 */
export class LocalMealsRepository implements MealsRepository {
  private data: StoredData;

  constructor() {
    const stored = loadFromStorage();
    if (stored) {
      this.data = stored;
    } else {
      const seed = createSeedData();
      this.data = { mealEntries: seed.mealEntries, waterEntries: seed.waterEntries, goals: DEFAULT_GOALS };
    }
    this.persist();
  }

  private persist() {
    saveToStorage(this.data);
  }

  async listMealEntries(): Promise<MealEntry[]> {
    return structuredClone(this.data.mealEntries);
  }

  async listWaterEntries(): Promise<WaterEntry[]> {
    return structuredClone(this.data.waterEntries);
  }

  async getGoals(): Promise<NutritionGoals> {
    return structuredClone(this.data.goals);
  }

  async createMealEntry(input: CreateMealEntryInput): Promise<MealEntry> {
    const now = new Date().toISOString();
    const entry: MealEntry = {
      id: uid(),
      mealType: input.mealType,
      name: input.name,
      calories: input.calories,
      protein: input.protein ?? 0,
      carbs: input.carbs ?? 0,
      fat: input.fat ?? 0,
      loggedAt: input.loggedAt ?? now,
      createdAt: now,
      updatedAt: now,
    };
    this.data.mealEntries.push(entry);
    this.persist();
    return structuredClone(entry);
  }

  async updateMealEntry(entryId: string, input: UpdateMealEntryInput): Promise<MealEntry> {
    const entry = findMealEntry(this.data, entryId);
    Object.assign(entry, input);
    entry.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(entry);
  }

  async deleteMealEntry(entryId: string): Promise<void> {
    this.data.mealEntries = this.data.mealEntries.filter((e) => e.id !== entryId);
    this.persist();
  }

  async createWaterEntry(input: CreateWaterEntryInput): Promise<WaterEntry> {
    const now = new Date().toISOString();
    const entry: WaterEntry = {
      id: uid(),
      amountMl: input.amountMl,
      loggedAt: input.loggedAt ?? now,
      createdAt: now,
    };
    this.data.waterEntries.push(entry);
    this.persist();
    return structuredClone(entry);
  }

  async deleteWaterEntry(entryId: string): Promise<void> {
    this.data.waterEntries = this.data.waterEntries.filter((e) => e.id !== entryId);
    this.persist();
  }

  async updateGoals(input: UpdateGoalsInput): Promise<NutritionGoals> {
    this.data.goals = { ...this.data.goals, ...input };
    this.persist();
    return structuredClone(this.data.goals);
  }
}
