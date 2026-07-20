export type TransactionType = "income" | "expense" | "saving" | "investment";

export const TRANSACTION_TYPES: TransactionType[] = ["income", "expense", "saving", "investment"];

export interface Category {
  id: string;
  name: string;
  color: string;
  /** Which transaction type this category applies to — an "Emergency Fund"
   *  category makes sense for savings, not income. */
  kind: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Whole currency units (e.g. whole VND — matches the DB's `bigint` column; no float rounding). */
  amount: number;
  currency: string;
  categoryId: string | null;
  note: string;
  /** ISO datetime. */
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  currency: string;
}

export interface TransactionFilters {
  search: string;
  types: TransactionType[];
  categoryIds: string[];
}

export const EMPTY_FILTERS: TransactionFilters = {
  search: "",
  types: [],
  categoryIds: [],
};
