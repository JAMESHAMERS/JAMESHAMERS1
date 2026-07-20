import { create } from "zustand";

import type {
  CreateBudgetInput,
  CreateCategoryInput,
  CreateTransactionInput,
  FinanceRepository,
  UpdateTransactionInput,
} from "../domain/repository";
import type { Budget, Category, Transaction, TransactionFilters } from "../domain/types";
import { EMPTY_FILTERS } from "../domain/types";
import { LocalFinanceRepository } from "../infrastructure/local-finance-repository";

export type FinanceTab = "overview" | "transactions" | "budgets" | "reports";

interface FinanceStoreState {
  repo: FinanceRepository | null;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  filters: TransactionFilters;
  tab: FinanceTab;
  /** First-of-month `Date` driving both the Budgets tab's progress and the Reports tab. */
  activeMonth: Date;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setTab: (tab: FinanceTab) => void;
  setFilters: (patch: Partial<TransactionFilters>) => void;
  setActiveMonth: (date: Date) => void;

  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (transactionId: string, input: UpdateTransactionInput) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;

  createCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (categoryId: string, input: { name?: string; color?: string }) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  createBudget: (input: CreateBudgetInput) => Promise<Budget>;
  updateBudget: (budgetId: string, input: { monthlyLimit?: number }) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
}

/**
 * The "application" layer for the Finance module, same shape as
 * `modules/tasks/application/task-store.ts`: each action is a thin call
 * into the injected `FinanceRepository` followed by a local state patch.
 * `presentation` only ever calls these actions.
 */
export const useFinanceStore = create<FinanceStoreState>((set, get) => ({
  repo: null,
  transactions: [],
  categories: [],
  budgets: [],
  filters: EMPTY_FILTERS,
  tab: "overview",
  activeMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    // Constructed here, not at module scope — see task-store.ts for why.
    const repo = new LocalFinanceRepository();
    const [transactions, categories, budgets] = await Promise.all([
      repo.listTransactions(),
      repo.listCategories(),
      repo.listBudgets(),
    ]);
    set({ repo, transactions, categories, budgets, hydrated: true });
  },

  setTab: (tab) => set({ tab }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  setActiveMonth: (date) => set({ activeMonth: date }),

  createTransaction: async (input) => {
    const transaction = await get().repo!.createTransaction(input);
    set((s) => ({ transactions: [...s.transactions, transaction] }));
    return transaction;
  },

  updateTransaction: async (transactionId, input) => {
    const updated = await get().repo!.updateTransaction(transactionId, input);
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === transactionId ? updated : t)),
    }));
  },

  deleteTransaction: async (transactionId) => {
    await get().repo!.deleteTransaction(transactionId);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== transactionId) }));
  },

  createCategory: async (input) => {
    const category = await get().repo!.createCategory(input);
    set((s) => ({ categories: [...s.categories, category] }));
    return category;
  },

  updateCategory: async (categoryId, input) => {
    const updated = await get().repo!.updateCategory(categoryId, input);
    set((s) => ({
      categories: s.categories.map((c) => (c.id === categoryId ? updated : c)),
    }));
  },

  deleteCategory: async (categoryId) => {
    await get().repo!.deleteCategory(categoryId);
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== categoryId),
      budgets: s.budgets.filter((b) => b.categoryId !== categoryId),
      transactions: s.transactions.map((t) =>
        t.categoryId === categoryId ? { ...t, categoryId: null } : t,
      ),
    }));
  },

  createBudget: async (input) => {
    const budget = await get().repo!.createBudget(input);
    set((s) => ({ budgets: [...s.budgets, budget] }));
    return budget;
  },

  updateBudget: async (budgetId, input) => {
    const updated = await get().repo!.updateBudget(budgetId, input);
    set((s) => ({ budgets: s.budgets.map((b) => (b.id === budgetId ? updated : b)) }));
  },

  deleteBudget: async (budgetId) => {
    await get().repo!.deleteBudget(budgetId);
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== budgetId) }));
  },
}));
