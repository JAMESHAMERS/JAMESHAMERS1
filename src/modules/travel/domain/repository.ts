import type {
  ExpenseCategory,
  ItineraryCategory,
  ItineraryItem,
  Trip,
  TripExpense,
  TripNote,
  TripPhoto,
} from "./types";

export interface CreateTripInput {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverColor?: string;
  budget?: number;
  currency?: string;
  notes?: string;
}

export type UpdateTripInput = Partial<Omit<CreateTripInput, "startDate" | "endDate">> & {
  startDate?: string;
  endDate?: string;
};

export interface CreateItineraryItemInput {
  tripId: string;
  category: ItineraryCategory;
  title: string;
  location?: string;
  lat?: number | null;
  lng?: number | null;
  startAt: string;
  endAt?: string | null;
  notes?: string;
}

export type UpdateItineraryItemInput = Partial<Omit<CreateItineraryItemInput, "tripId">>;

export interface CreateExpenseInput {
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  note?: string;
  spentAt?: string;
}

export type UpdateExpenseInput = Partial<Omit<CreateExpenseInput, "tripId">>;

export interface CreatePhotoInput {
  tripId: string;
  url: string;
  caption?: string;
  lat?: number | null;
  lng?: number | null;
  takenAt?: string;
}

export interface CreateNoteInput {
  tripId: string;
  title?: string;
  body: string;
}

export type UpdateNoteInput = Partial<Omit<CreateNoteInput, "tripId">>;

/**
 * Storage-agnostic contract for everything the Travel module needs to
 * persist. `LocalTravelRepository` (active today, browser-only) and
 * `SupabaseTravelRepository` (production adapter, wired in once auth
 * exists — see docs/ROADMAP.md) both implement this exactly, so
 * `application` and `presentation` never know which one is behind it.
 */
export interface TravelRepository {
  listTrips(): Promise<Trip[]>;
  listItineraryItems(): Promise<ItineraryItem[]>;
  listExpenses(): Promise<TripExpense[]>;
  listPhotos(): Promise<TripPhoto[]>;
  listNotes(): Promise<TripNote[]>;

  createTrip(input: CreateTripInput): Promise<Trip>;
  updateTrip(tripId: string, input: UpdateTripInput): Promise<Trip>;
  /** Cascades: also removes the trip's itinerary items, expenses, photos, and notes. */
  deleteTrip(tripId: string): Promise<void>;

  createItineraryItem(input: CreateItineraryItemInput): Promise<ItineraryItem>;
  updateItineraryItem(itemId: string, input: UpdateItineraryItemInput): Promise<ItineraryItem>;
  deleteItineraryItem(itemId: string): Promise<void>;

  createExpense(input: CreateExpenseInput): Promise<TripExpense>;
  updateExpense(expenseId: string, input: UpdateExpenseInput): Promise<TripExpense>;
  deleteExpense(expenseId: string): Promise<void>;

  createPhoto(input: CreatePhotoInput): Promise<TripPhoto>;
  deletePhoto(photoId: string): Promise<void>;

  createNote(input: CreateNoteInput): Promise<TripNote>;
  updateNote(noteId: string, input: UpdateNoteInput): Promise<TripNote>;
  deleteNote(noteId: string): Promise<void>;
}
