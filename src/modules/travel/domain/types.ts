export type TripStatus = "upcoming" | "ongoing" | "completed";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  /** Date-only (YYYY-MM-DD), like Tasks' `dueDate` — a trip spans whole days, not instants. */
  startDate: string;
  endDate: string;
  coverColor: string;
  budget: number;
  currency: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ItineraryCategory = "flight" | "hotel" | "activity" | "food" | "transport" | "other";

export const ITINERARY_CATEGORIES: ItineraryCategory[] = [
  "flight",
  "hotel",
  "activity",
  "food",
  "transport",
  "other",
];

export interface ItineraryItem {
  id: string;
  tripId: string;
  category: ItineraryCategory;
  title: string;
  location: string;
  lat: number | null;
  lng: number | null;
  /** ISO datetime. */
  startAt: string;
  endAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = "transport" | "accommodation" | "food" | "activities" | "shopping" | "other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "transport",
  "accommodation",
  "food",
  "activities",
  "shopping",
  "other",
];

export interface TripExpense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  note: string;
  /** ISO datetime. */
  spentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripPhoto {
  id: string;
  tripId: string;
  /** Object/data URL — see LocalTravelRepository for why this doesn't survive a reload, same as Tasks' attachments. */
  url: string;
  caption: string;
  lat: number | null;
  lng: number | null;
  takenAt: string;
  createdAt: string;
}

export interface TripNote {
  id: string;
  tripId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export const COVER_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];
