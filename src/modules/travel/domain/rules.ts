import type {
  ExpenseCategory,
  ItineraryItem,
  Trip,
  TripExpense,
  TripNote,
  TripPhoto,
  TripStatus,
} from "./types";

/** Pure business rules — no framework, no I/O, trivially unit-testable. */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function dateKeyOf(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function tripStatus(trip: Trip, now: Date = new Date()): TripStatus {
  const today = dateKeyOf(now);
  if (today < trip.startDate) return "upcoming";
  if (today > trip.endDate) return "completed";
  return "ongoing";
}

/** Inclusive day count spanned by the trip (a same-day trip is 1 day). */
export function tripDurationDays(trip: Trip) {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function sortTripsByStartDate(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function itineraryForTrip(items: ItineraryItem[], tripId: string): ItineraryItem[] {
  return items.filter((i) => i.tripId === tripId).sort((a, b) => a.startAt.localeCompare(b.startAt));
}

export function expensesForTrip(expenses: TripExpense[], tripId: string): TripExpense[] {
  return expenses
    .filter((e) => e.tripId === tripId)
    .sort((a, b) => b.spentAt.localeCompare(a.spentAt));
}

export function photosForTrip(photos: TripPhoto[], tripId: string): TripPhoto[] {
  return photos.filter((p) => p.tripId === tripId).sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}

export function notesForTrip(notes: TripNote[], tripId: string): TripNote[] {
  return notes.filter((n) => n.tripId === tripId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function sumExpenses(expenses: TripExpense[]) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function budgetProgress(trip: Trip, expenses: TripExpense[]) {
  const spent = sumExpenses(expensesForTrip(expenses, trip.id));
  const percent = trip.budget === 0 ? 0 : Math.round((spent / trip.budget) * 100);
  return { spent, limit: trip.budget, percent: Math.min(100, percent), isOver: spent > trip.budget };
}

export interface CategoryTotal<T extends string> {
  category: T;
  total: number;
}

export function expenseBreakdown(expenses: TripExpense[]): CategoryTotal<ExpenseCategory>[] {
  const totals = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export interface ItineraryDayGroup {
  dayKey: string;
  date: Date;
  items: ItineraryItem[];
}

export function groupItineraryByDay(items: ItineraryItem[]): ItineraryDayGroup[] {
  const sorted = [...items].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const map = new Map<string, ItineraryItem[]>();
  for (const item of sorted) {
    const key = dateKeyOf(new Date(item.startAt));
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return Array.from(map.entries()).map(([dayKey, dayItems]) => ({
    dayKey,
    date: new Date(dayItems[0].startAt),
    items: dayItems,
  }));
}

export type TimelineEventType = "itinerary" | "expense" | "photo" | "note";

export interface TimelineEvent {
  type: TimelineEventType;
  id: string;
  at: string;
  itineraryItem?: ItineraryItem;
  expense?: TripExpense;
  photo?: TripPhoto;
  note?: TripNote;
}

/** Chronological (oldest-first) feed of everything logged for a trip. */
export function buildTimeline(
  tripId: string,
  items: ItineraryItem[],
  expenses: TripExpense[],
  photos: TripPhoto[],
  notes: TripNote[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...itineraryForTrip(items, tripId).map((i) => ({ type: "itinerary" as const, id: i.id, at: i.startAt, itineraryItem: i })),
    ...expensesForTrip(expenses, tripId).map((e) => ({ type: "expense" as const, id: e.id, at: e.spentAt, expense: e })),
    ...photosForTrip(photos, tripId).map((p) => ({ type: "photo" as const, id: p.id, at: p.takenAt, photo: p })),
    ...notesForTrip(notes, tripId).map((n) => ({ type: "note" as const, id: n.id, at: n.createdAt, note: n })),
  ];
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

export interface TravelStats {
  totalTrips: number;
  upcomingCount: number;
  ongoingCount: number;
  completedCount: number;
  totalSpend: number;
  totalDays: number;
  uniqueDestinations: number;
}

export function computeTravelStats(trips: Trip[], expenses: TripExpense[], now: Date = new Date()): TravelStats {
  const statuses = trips.map((t) => tripStatus(t, now));
  return {
    totalTrips: trips.length,
    upcomingCount: statuses.filter((s) => s === "upcoming").length,
    ongoingCount: statuses.filter((s) => s === "ongoing").length,
    completedCount: statuses.filter((s) => s === "completed").length,
    totalSpend: sumExpenses(expenses),
    totalDays: trips.reduce((sum, t) => sum + tripDurationDays(t), 0),
    uniqueDestinations: new Set(trips.map((t) => t.destination.trim().toLowerCase())).size,
  };
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

export interface MonthlySpendPoint {
  monthKey: string;
  monthDate: Date;
  total: number;
}

export function monthlySpendTrend(expenses: TripExpense[], months: Date[]): MonthlySpendPoint[] {
  return months.map((monthDate) => {
    const key = monthKeyOf(monthDate);
    const total = expenses
      .filter((e) => monthKeyOf(new Date(e.spentAt)) === key)
      .reduce((sum, e) => sum + e.amount, 0);
    return { monthKey: key, monthDate, total };
  });
}
