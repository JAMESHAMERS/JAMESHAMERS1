import { createClient } from "@/shared/lib/supabase/client";
import type {
  CreateMealEntryInput,
  CreateWaterEntryInput,
  MealsRepository,
  UpdateGoalsInput,
  UpdateMealEntryInput,
} from "../domain/repository";
import type { MealEntry, NutritionGoals, WaterEntry } from "../domain/types";
import { DEFAULT_GOALS } from "../domain/types";

/**
 * Production `MealsRepository` implementation against
 * `supabase/migrations/0010_meals.sql`. Not currently instantiated anywhere
 * — `application/meals-store.ts` uses `LocalMealsRepository` until auth
 * exists (there's no `auth.uid()` for RLS to scope rows to yet). Swapping it
 * in later is a one-line change there, not a rewrite of this file or of
 * `presentation`.
 */
export class SupabaseMealsRepository implements MealsRepository {
  private supabase = createClient();

  private async currentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("SupabaseMealsRepository requires an authenticated user.");
    return user.id;
  }

  async listMealEntries(): Promise<MealEntry[]> {
    const { data, error } = await this.supabase
      .from("meal_entries")
      .select("*")
      .order("logged_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      mealType: row.meal_type,
      name: row.name,
      calories: row.calories,
      protein: row.protein_g,
      carbs: row.carbs_g,
      fat: row.fat_g,
      loggedAt: row.logged_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listWaterEntries(): Promise<WaterEntry[]> {
    const { data, error } = await this.supabase
      .from("water_entries")
      .select("*")
      .order("logged_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      amountMl: row.amount_ml,
      loggedAt: row.logged_at,
      createdAt: row.created_at,
    }));
  }

  async getGoals(): Promise<NutritionGoals> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("nutrition_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return DEFAULT_GOALS;
    return {
      calories: data.calories,
      protein: data.protein_g,
      carbs: data.carbs_g,
      fat: data.fat_g,
      waterMl: data.water_ml,
    };
  }

  async createMealEntry(input: CreateMealEntryInput): Promise<MealEntry> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("meal_entries")
      .insert({
        user_id: userId,
        meal_type: input.mealType,
        name: input.name,
        calories: input.calories,
        protein_g: input.protein ?? 0,
        carbs_g: input.carbs ?? 0,
        fat_g: input.fat ?? 0,
        logged_at: input.loggedAt ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      mealType: data.meal_type,
      name: data.name,
      calories: data.calories,
      protein: data.protein_g,
      carbs: data.carbs_g,
      fat: data.fat_g,
      loggedAt: data.logged_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateMealEntry(entryId: string, input: UpdateMealEntryInput): Promise<MealEntry> {
    const { data, error } = await this.supabase
      .from("meal_entries")
      .update({
        meal_type: input.mealType,
        name: input.name,
        calories: input.calories,
        protein_g: input.protein,
        carbs_g: input.carbs,
        fat_g: input.fat,
        logged_at: input.loggedAt,
      })
      .eq("id", entryId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      mealType: data.meal_type,
      name: data.name,
      calories: data.calories,
      protein: data.protein_g,
      carbs: data.carbs_g,
      fat: data.fat_g,
      loggedAt: data.logged_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteMealEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase.from("meal_entries").delete().eq("id", entryId);
    if (error) throw error;
  }

  async createWaterEntry(input: CreateWaterEntryInput): Promise<WaterEntry> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("water_entries")
      .insert({
        user_id: userId,
        amount_ml: input.amountMl,
        logged_at: input.loggedAt ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, amountMl: data.amount_ml, loggedAt: data.logged_at, createdAt: data.created_at };
  }

  async deleteWaterEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase.from("water_entries").delete().eq("id", entryId);
    if (error) throw error;
  }

  async updateGoals(input: UpdateGoalsInput): Promise<NutritionGoals> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("nutrition_goals")
      .upsert(
        {
          user_id: userId,
          calories: input.calories,
          protein_g: input.protein,
          carbs_g: input.carbs,
          fat_g: input.fat,
          water_ml: input.waterMl,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw error;
    return {
      calories: data.calories,
      protein: data.protein_g,
      carbs: data.carbs_g,
      fat: data.fat_g,
      waterMl: data.water_ml,
    };
  }
}
