import type { OverviewData } from "../domain/types";

/**
 * Static stand-in for a real `OverviewRepository`. Once Tasks/Habits/
 * Finance/Goals exist as real modules, this is replaced by an application
 * use-case that composes their repositories — the widgets below only
 * depend on `OverviewData`, so that swap won't touch `presentation`.
 */
export function getOverviewData(): OverviewData {
  const today = new Date();
  const dateKey = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const weekdayShort = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d;
  };

  const trend = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    const seed = (offset + 20) * 37;
    return {
      dayKey: weekdayShort(offset).toISOString(),
      income: offset === 0 ? 0 : 200_000 + ((seed * 13) % 400_000),
      expense: 80_000 + ((seed * 7) % 260_000),
    };
  });

  const income = trend.reduce((sum, d) => sum + d.income, 0) + 8_500_000;
  const expense = trend.reduce((sum, d) => sum + d.expense, 0) + 3_200_000;

  return {
    tasksToday: [
      { id: "t1", titleKey: "standup", done: true, priority: "medium" },
      { id: "t2", titleKey: "reviewPr", done: false, priority: "high" },
      { id: "t3", titleKey: "designSync", done: false, priority: "medium" },
      { id: "t4", titleKey: "gymSession", done: false, priority: "low" },
      { id: "t5", titleKey: "readChapter", done: true, priority: "low" },
    ],
    goals: [
      { id: "g1", titleKey: "readBooks", progress: 58, categoryKey: "personal" },
      { id: "g2", titleKey: "emergencyFund", progress: 74, categoryKey: "finance" },
      { id: "g3", titleKey: "runMarathon", progress: 32, categoryKey: "health" },
    ],
    activity: [
      { id: "a1", kind: "task", messageKey: "completedTask", messageValues: { title: "Daily standup" }, minutesAgo: 24 },
      { id: "a2", kind: "finance", messageKey: "addedExpense", messageValues: { amount: "120,000₫" }, minutesAgo: 96 },
      { id: "a3", kind: "habit", messageKey: "loggedHabit", messageValues: { title: "Meditation" }, minutesAgo: 210 },
      { id: "a4", kind: "journal", messageKey: "wroteEntry", minutesAgo: 340 },
      { id: "a5", kind: "task", messageKey: "completedTask", messageValues: { title: "Read chapter 4" }, minutesAgo: 480 },
    ],
    finance: {
      income,
      expense,
      balance: income - expense,
      currency: "VND",
      trend,
    },
    productivity: {
      score: 78,
      tasksCompleted: 18,
      tasksTotal: 23,
      streakDays: 6,
    },
    markedDates: [dateKey(0), dateKey(2), dateKey(5), dateKey(-3), dateKey(9)],
  };
}
