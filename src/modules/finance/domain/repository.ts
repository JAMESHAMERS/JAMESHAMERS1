import type { Budget, Category, Transaction, TransactionType } from "./types";

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  currency?: string;
  categoryId?: string | null;
  note?: string;
  occurredAt?: string;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  categoryId?: string | null;
  note?: string;
  occurredAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  kind: TransactionType;
}

export interface CreateBudgetInput {
  categoryId: string;
  monthlyLimit: number;
  currency?: string;
}

/**
 * Storage-agnostic contract for everything the Finance module needs to
 * persist. `LocalFinanceRepository` (active today, browser-only) and
 * `SupabaseFinanceRepository` (production adapter, wired in once auth
 * exists — see docs/ROADMAP.md) both implement this exactly, so
 * `application` and `presentation` never know which one is behind it.
 */
export interface FinanceRepository {
  listTransactions(): Promise<Transaction[]>;
  listCategories(): Promise<Category[]>;
  listBudgets(): Promise<Budget[]>;

  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
  updateTransaction(transactionId: string, input: UpdateTransactionInput): Promise<Transaction>;
  deleteTransaction(transactionId: string): Promise<void>;

  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(categoryId: string, input: { name?: string; color?: string }): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;

  createBudget(input: CreateBudgetInput): Promise<Budget>;
  updateBudget(budgetId: string, input: { monthlyLimit?: number }): Promise<Budget>;
  deleteBudget(budgetId: string): Promise<void>;
}
