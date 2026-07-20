import type { Budget, Transaction, TransactionFilters, TransactionType } from "./types";

/** Pure business rules — no framework, no I/O, trivially unit-testable. */

export function getMonthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

export function monthKeyOf(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

/** Oldest-first array of the first-of-month `Date` for the last `count` months, including the current one. */
export function lastMonths(count: number, from: Date = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i;
    return new Date(from.getFullYear(), from.getMonth() - offset, 1);
  });
}

export function sumByType(transactions: Transaction[], type: TransactionType) {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

export interface MonthlyBreakdownPoint {
  monthKey: string;
  monthDate: Date;
  income: number;
  expense: number;
  saving: number;
  investment: number;
  /** Operating cash flow: income minus expense. Saving/investment are
   *  allocations of that surplus, not separate inflows/outflows. */
  net: number;
}

export function monthlyBreakdown(
  transactions: Transaction[],
  months: Date[],
): MonthlyBreakdownPoint[] {
  return months.map((monthDate) => {
    const key = monthKeyOf(monthDate);
    const inMonth = transactions.filter((t) => getMonthKey(t.occurredAt) === key);
    const income = sumByType(inMonth, "income");
    const expense = sumByType(inMonth, "expense");
    const saving = sumByType(inMonth, "saving");
    const investment = sumByType(inMonth, "investment");
    return { monthKey: key, monthDate, income, expense, saving, investment, net: income - expense };
  });
}

export interface CategoryTotal {
  categoryId: string | null;
  total: number;
}

export function categoryBreakdown(
  transactions: Transaction[],
  type: TransactionType,
  monthDate?: Date,
): CategoryTotal[] {
  const monthKey = monthDate ? monthKeyOf(monthDate) : null;
  const totals = new Map<string | null, number>();

  for (const t of transactions) {
    if (t.type !== type) continue;
    if (monthKey && getMonthKey(t.occurredAt) !== monthKey) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }

  return Array.from(totals.entries())
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

export function budgetProgress(budget: Budget, transactions: Transaction[], monthDate: Date) {
  const key = monthKeyOf(monthDate);
  const spent = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.categoryId === budget.categoryId &&
        getMonthKey(t.occurredAt) === key,
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const percent = budget.monthlyLimit === 0 ? 0 : Math.round((spent / budget.monthlyLimit) * 100);
  return { spent, limit: budget.monthlyLimit, percent, isOver: spent > budget.monthlyLimit };
}

export function matchesFilters(transaction: Transaction, filters: TransactionFilters) {
  const search = filters.search.trim().toLowerCase();
  if (search && !transaction.note.toLowerCase().includes(search)) return false;
  if (filters.types.length && !filters.types.includes(transaction.type)) return false;
  if (
    filters.categoryIds.length &&
    (!transaction.categoryId || !filters.categoryIds.includes(transaction.categoryId))
  ) {
    return false;
  }
  return true;
}

export function filterTransactions(transactions: Transaction[], filters: TransactionFilters) {
  return transactions.filter((t) => matchesFilters(t, filters));
}

export function sortByDateDesc(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
