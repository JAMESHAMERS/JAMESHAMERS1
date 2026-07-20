import type {
  CreateBudgetInput,
  CreateCategoryInput,
  CreateTransactionInput,
  FinanceRepository,
  UpdateTransactionInput,
} from "../domain/repository";
import type { Budget, Category, Transaction } from "../domain/types";
import { createSeedData } from "./seed-data";

const STORAGE_KEY = "lifeos:finance:v1";

interface StoredData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
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

function findTransaction(data: StoredData, id: string): Transaction {
  const transaction = data.transactions.find((t) => t.id === id);
  if (!transaction) throw new Error(`Transaction not found: ${id}`);
  return transaction;
}

/**
 * Browser `localStorage`-backed `FinanceRepository`. Active until auth
 * exists (see docs/ROADMAP.md and src/modules/finance/README.md) — every
 * method still returns a Promise so swapping in `SupabaseFinanceRepository`
 * later doesn't change any call site.
 *
 * Must only be constructed client-side (it touches `localStorage` in its
 * constructor); `application/finance-store.ts` only does so from a
 * post-mount effect, never at module scope, so it never runs during SSR.
 */
export class LocalFinanceRepository implements FinanceRepository {
  private data: StoredData;

  constructor() {
    const stored = loadFromStorage();
    if (stored) {
      this.data = stored;
    } else {
      const seed = createSeedData();
      this.data = { transactions: seed.transactions, categories: seed.categories, budgets: [] };
    }
    this.persist();
  }

  private persist() {
    saveToStorage(this.data);
  }

  async listTransactions(): Promise<Transaction[]> {
    return structuredClone(this.data.transactions);
  }

  async listCategories(): Promise<Category[]> {
    return structuredClone(this.data.categories);
  }

  async listBudgets(): Promise<Budget[]> {
    return structuredClone(this.data.budgets);
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: uid(),
      type: input.type,
      amount: input.amount,
      currency: input.currency ?? "VND",
      categoryId: input.categoryId ?? null,
      note: input.note ?? "",
      occurredAt: input.occurredAt ?? now,
      createdAt: now,
      updatedAt: now,
    };
    this.data.transactions.push(transaction);
    this.persist();
    return structuredClone(transaction);
  }

  async updateTransaction(transactionId: string, input: UpdateTransactionInput): Promise<Transaction> {
    const transaction = findTransaction(this.data, transactionId);
    Object.assign(transaction, input);
    transaction.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(transaction);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    this.data.transactions = this.data.transactions.filter((t) => t.id !== transactionId);
    this.persist();
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const category: Category = { id: uid(), name: input.name, color: input.color, kind: input.kind };
    this.data.categories.push(category);
    this.persist();
    return structuredClone(category);
  }

  async updateCategory(categoryId: string, input: { name?: string; color?: string }): Promise<Category> {
    const category = this.data.categories.find((c) => c.id === categoryId);
    if (!category) throw new Error(`Category not found: ${categoryId}`);
    Object.assign(category, input);
    this.persist();
    return structuredClone(category);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    this.data.categories = this.data.categories.filter((c) => c.id !== categoryId);
    this.data.budgets = this.data.budgets.filter((b) => b.categoryId !== categoryId);
    for (const transaction of this.data.transactions) {
      if (transaction.categoryId === categoryId) transaction.categoryId = null;
    }
    this.persist();
  }

  async createBudget(input: CreateBudgetInput): Promise<Budget> {
    const budget: Budget = {
      id: uid(),
      categoryId: input.categoryId,
      monthlyLimit: input.monthlyLimit,
      currency: input.currency ?? "VND",
    };
    this.data.budgets.push(budget);
    this.persist();
    return structuredClone(budget);
  }

  async updateBudget(budgetId: string, input: { monthlyLimit?: number }): Promise<Budget> {
    const budget = this.data.budgets.find((b) => b.id === budgetId);
    if (!budget) throw new Error(`Budget not found: ${budgetId}`);
    Object.assign(budget, input);
    this.persist();
    return structuredClone(budget);
  }

  async deleteBudget(budgetId: string): Promise<void> {
    this.data.budgets = this.data.budgets.filter((b) => b.id !== budgetId);
    this.persist();
  }
}
