import type { Category, Transaction } from "../domain/types";

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

const CATEGORY_SEED: Omit<Category, "id">[] = [
  { name: "Salary", color: "#22c55e", kind: "income" },
  { name: "Freelance", color: "#0ea5e9", kind: "income" },
  { name: "Groceries", color: "#f59e0b", kind: "expense" },
  { name: "Rent", color: "#ef4444", kind: "expense" },
  { name: "Transport", color: "#8b5cf6", kind: "expense" },
  { name: "Dining Out", color: "#ec4899", kind: "expense" },
  { name: "Utilities", color: "#14b8a6", kind: "expense" },
  { name: "Entertainment", color: "#6366f1", kind: "expense" },
  { name: "Shopping", color: "#f97316", kind: "expense" },
  { name: "Health", color: "#06b6d4", kind: "expense" },
  { name: "Emergency Fund", color: "#22c55e", kind: "saving" },
  { name: "Travel Fund", color: "#0ea5e9", kind: "saving" },
  { name: "Stocks", color: "#8b5cf6", kind: "investment" },
  { name: "Crypto", color: "#f59e0b", kind: "investment" },
];

const EXPENSE_PROFILE: { name: string; min: number; max: number; perMonth: [number, number] }[] = [
  { name: "Rent", min: 4_500_000, max: 4_500_000, perMonth: [1, 1] },
  { name: "Groceries", min: 150_000, max: 650_000, perMonth: [5, 8] },
  { name: "Transport", min: 40_000, max: 250_000, perMonth: [4, 7] },
  { name: "Dining Out", min: 80_000, max: 500_000, perMonth: [3, 6] },
  { name: "Utilities", min: 300_000, max: 900_000, perMonth: [2, 3] },
  { name: "Entertainment", min: 100_000, max: 600_000, perMonth: [1, 3] },
  { name: "Shopping", min: 150_000, max: 1_800_000, perMonth: [1, 4] },
  { name: "Health", min: 100_000, max: 800_000, perMonth: [0, 2] },
];

function isoAt(year: number, month: number, day: number, rand: () => number) {
  const d = new Date(year, month, Math.min(day, 28), 8 + Math.floor(rand() * 10), Math.floor(rand() * 60));
  return d.toISOString();
}

/**
 * Deterministic ~4 months of realistic transaction history so the Overview
 * stat cards, cash-flow trend, and category donuts all have something
 * meaningful to render on first visit — not just an empty state.
 */
export function createSeedData(): { transactions: Transaction[]; categories: Category[] } {
  const rand = mulberry32(20260720);
  const categories: Category[] = CATEGORY_SEED.map((c, i) => ({ id: `cat-${i}`, ...c }));
  const byName = (name: string) => categories.find((c) => c.name === name)!;

  const now = new Date();
  const transactions: Transaction[] = [];
  let idCounter = 0;
  const nextId = () => `seed-tx-${idCounter++}`;

  const push = (input: Omit<Transaction, "id" | "currency" | "createdAt" | "updatedAt">) => {
    transactions.push({
      id: nextId(),
      currency: "VND",
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
      ...input,
    });
  };

  for (let monthOffset = 3; monthOffset >= 0; monthOffset--) {
    const year = now.getFullYear();
    const month = now.getMonth() - monthOffset;
    const isCurrentMonth = monthOffset === 0;
    const dayCap = isCurrentMonth ? now.getDate() : 28;

    // Income.
    push({
      type: "income",
      amount: 16_000_000 + Math.floor(rand() * 2_000_000),
      categoryId: byName("Salary").id,
      note: "Monthly salary",
      occurredAt: isoAt(year, month, 1, rand),
    });
    if (rand() > 0.4) {
      push({
        type: "income",
        amount: 800_000 + Math.floor(rand() * 3_000_000),
        categoryId: byName("Freelance").id,
        note: "Freelance project",
        occurredAt: isoAt(year, month, 5 + Math.floor(rand() * 15), rand),
      });
    }

    // Expenses.
    for (const profile of EXPENSE_PROFILE) {
      const category = byName(profile.name);
      const count = profile.perMonth[0] + Math.floor(rand() * (profile.perMonth[1] - profile.perMonth[0] + 1));
      for (let i = 0; i < count; i++) {
        const day = Math.min(dayCap, 1 + Math.floor(rand() * 28));
        push({
          type: "expense",
          amount: Math.round(profile.min + rand() * (profile.max - profile.min)),
          categoryId: category.id,
          note: profile.name,
          occurredAt: isoAt(year, month, day, rand),
        });
      }
    }

    // Saving + investment allocations.
    push({
      type: "saving",
      amount: 1_500_000 + Math.floor(rand() * 1_000_000),
      categoryId: byName("Emergency Fund").id,
      note: "Monthly transfer",
      occurredAt: isoAt(year, month, 3, rand),
    });
    if (rand() > 0.5) {
      push({
        type: "saving",
        amount: 500_000 + Math.floor(rand() * 800_000),
        categoryId: byName("Travel Fund").id,
        note: "Trip savings",
        occurredAt: isoAt(year, month, 10, rand),
      });
    }
    push({
      type: "investment",
      amount: 1_000_000 + Math.floor(rand() * 2_000_000),
      categoryId: byName("Stocks").id,
      note: "Index fund purchase",
      occurredAt: isoAt(year, month, 15, rand),
    });
    if (rand() > 0.6) {
      push({
        type: "investment",
        amount: 300_000 + Math.floor(rand() * 700_000),
        categoryId: byName("Crypto").id,
        note: "DCA buy",
        occurredAt: isoAt(year, month, 20, rand),
      });
    }
  }

  return { transactions, categories };
}
