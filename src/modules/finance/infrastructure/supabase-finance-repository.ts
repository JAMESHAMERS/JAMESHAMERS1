import { createClient } from "@/shared/lib/supabase/client";
import type {
  CreateBudgetInput,
  CreateCategoryInput,
  CreateTransactionInput,
  FinanceRepository,
  UpdateTransactionInput,
} from "../domain/repository";
import type { Budget, Category, Transaction } from "../domain/types";

/**
 * Production `FinanceRepository` implementation against
 * `supabase/migrations/0007_finance.sql` + `0009_finance_extended.sql`. Not
 * currently instantiated anywhere — `application/finance-store.ts` uses
 * `LocalFinanceRepository` until auth exists (there's no `auth.uid()` for
 * RLS to scope rows to yet). Swapping it in later is a one-line change
 * there, not a rewrite of this file or of `presentation`.
 */
export class SupabaseFinanceRepository implements FinanceRepository {
  private supabase = createClient();

  private async currentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("SupabaseFinanceRepository requires an authenticated user.");
    return user.id;
  }

  async listTransactions(): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from("transactions")
      .select("*")
      .order("occurred_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      currency: row.currency,
      categoryId: row.category_id,
      note: row.note ?? "",
      occurredAt: row.occurred_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data.map((row) => ({ id: row.id, name: row.name, color: row.color, kind: row.kind }));
  }

  async listBudgets(): Promise<Budget[]> {
    const { data, error } = await this.supabase.from("budgets").select("*");
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      categoryId: row.category_id,
      monthlyLimit: row.monthly_limit,
      currency: row.currency,
    }));
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: input.type,
        amount: input.amount,
        currency: input.currency ?? "VND",
        category_id: input.categoryId ?? null,
        note: input.note ?? null,
        occurred_at: input.occurredAt ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      categoryId: data.category_id,
      note: data.note ?? "",
      occurredAt: data.occurred_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateTransaction(transactionId: string, input: UpdateTransactionInput): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from("transactions")
      .update({
        type: input.type,
        amount: input.amount,
        category_id: input.categoryId,
        note: input.note,
        occurred_at: input.occurredAt,
      })
      .eq("id", transactionId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      categoryId: data.category_id,
      note: data.note ?? "",
      occurredAt: data.occurred_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await this.supabase.from("transactions").delete().eq("id", transactionId);
    if (error) throw error;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("categories")
      .insert({ user_id: userId, name: input.name, color: input.color, kind: input.kind })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, name: data.name, color: data.color, kind: data.kind };
  }

  async updateCategory(categoryId: string, input: { name?: string; color?: string }): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .update(input)
      .eq("id", categoryId)
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, name: data.name, color: data.color, kind: data.kind };
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await this.supabase.from("categories").delete().eq("id", categoryId);
    if (error) throw error;
  }

  async createBudget(input: CreateBudgetInput): Promise<Budget> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("budgets")
      .insert({
        user_id: userId,
        category_id: input.categoryId,
        monthly_limit: input.monthlyLimit,
        currency: input.currency ?? "VND",
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      categoryId: data.category_id,
      monthlyLimit: data.monthly_limit,
      currency: data.currency,
    };
  }

  async updateBudget(budgetId: string, input: { monthlyLimit?: number }): Promise<Budget> {
    const { data, error } = await this.supabase
      .from("budgets")
      .update({ monthly_limit: input.monthlyLimit })
      .eq("id", budgetId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      categoryId: data.category_id,
      monthlyLimit: data.monthly_limit,
      currency: data.currency,
    };
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await this.supabase.from("budgets").delete().eq("id", budgetId);
    if (error) throw error;
  }
}
