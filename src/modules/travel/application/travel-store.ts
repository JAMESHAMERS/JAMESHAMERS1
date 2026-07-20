import { create } from "zustand";

import type {
  CreateExpenseInput,
  CreateItineraryItemInput,
  CreateNoteInput,
  CreatePhotoInput,
  CreateTripInput,
  TravelRepository,
  UpdateExpenseInput,
  UpdateItineraryItemInput,
  UpdateNoteInput,
  UpdateTripInput,
} from "../domain/repository";
import type { ItineraryItem, Trip, TripExpense, TripNote, TripPhoto } from "../domain/types";
import { LocalTravelRepository } from "../infrastructure/local-travel-repository";

export type TravelTab = "trips" | "statistics";
export type TripDetailTab = "itinerary" | "expenses" | "photos" | "map" | "notes" | "timeline";

interface TravelStoreState {
  repo: TravelRepository | null;
  trips: Trip[];
  itineraryItems: ItineraryItem[];
  expenses: TripExpense[];
  photos: TripPhoto[];
  notes: TripNote[];
  tab: TravelTab;
  selectedTripId: string | null;
  detailTab: TripDetailTab;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setTab: (tab: TravelTab) => void;
  openTrip: (tripId: string) => void;
  closeTrip: () => void;
  setDetailTab: (tab: TripDetailTab) => void;

  createTrip: (input: CreateTripInput) => Promise<Trip>;
  updateTrip: (tripId: string, input: UpdateTripInput) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;

  createItineraryItem: (input: CreateItineraryItemInput) => Promise<ItineraryItem>;
  updateItineraryItem: (itemId: string, input: UpdateItineraryItemInput) => Promise<void>;
  deleteItineraryItem: (itemId: string) => Promise<void>;

  createExpense: (input: CreateExpenseInput) => Promise<TripExpense>;
  updateExpense: (expenseId: string, input: UpdateExpenseInput) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;

  createPhoto: (input: CreatePhotoInput) => Promise<TripPhoto>;
  deletePhoto: (photoId: string) => Promise<void>;

  createNote: (input: CreateNoteInput) => Promise<TripNote>;
  updateNote: (noteId: string, input: UpdateNoteInput) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

/**
 * The "application" layer for the Travel module, same shape as
 * `modules/finance/application/finance-store.ts`: each action is a thin
 * call into the injected `TravelRepository` followed by a local state
 * patch. `presentation` only ever calls these actions.
 */
export const useTravelStore = create<TravelStoreState>((set, get) => ({
  repo: null,
  trips: [],
  itineraryItems: [],
  expenses: [],
  photos: [],
  notes: [],
  tab: "trips",
  selectedTripId: null,
  detailTab: "itinerary",
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    // Constructed here, not at module scope — see finance-store.ts for why.
    const repo = new LocalTravelRepository();
    const [trips, itineraryItems, expenses, photos, notes] = await Promise.all([
      repo.listTrips(),
      repo.listItineraryItems(),
      repo.listExpenses(),
      repo.listPhotos(),
      repo.listNotes(),
    ]);
    set({ repo, trips, itineraryItems, expenses, photos, notes, hydrated: true });
  },

  setTab: (tab) => set({ tab }),
  openTrip: (tripId) => set({ selectedTripId: tripId, detailTab: "itinerary" }),
  closeTrip: () => set({ selectedTripId: null }),
  setDetailTab: (detailTab) => set({ detailTab }),

  createTrip: async (input) => {
    const trip = await get().repo!.createTrip(input);
    set((s) => ({ trips: [...s.trips, trip] }));
    return trip;
  },

  updateTrip: async (tripId, input) => {
    const updated = await get().repo!.updateTrip(tripId, input);
    set((s) => ({ trips: s.trips.map((t) => (t.id === tripId ? updated : t)) }));
  },

  deleteTrip: async (tripId) => {
    await get().repo!.deleteTrip(tripId);
    set((s) => ({
      trips: s.trips.filter((t) => t.id !== tripId),
      itineraryItems: s.itineraryItems.filter((i) => i.tripId !== tripId),
      expenses: s.expenses.filter((e) => e.tripId !== tripId),
      photos: s.photos.filter((p) => p.tripId !== tripId),
      notes: s.notes.filter((n) => n.tripId !== tripId),
      selectedTripId: s.selectedTripId === tripId ? null : s.selectedTripId,
    }));
  },

  createItineraryItem: async (input) => {
    const item = await get().repo!.createItineraryItem(input);
    set((s) => ({ itineraryItems: [...s.itineraryItems, item] }));
    return item;
  },

  updateItineraryItem: async (itemId, input) => {
    const updated = await get().repo!.updateItineraryItem(itemId, input);
    set((s) => ({ itineraryItems: s.itineraryItems.map((i) => (i.id === itemId ? updated : i)) }));
  },

  deleteItineraryItem: async (itemId) => {
    await get().repo!.deleteItineraryItem(itemId);
    set((s) => ({ itineraryItems: s.itineraryItems.filter((i) => i.id !== itemId) }));
  },

  createExpense: async (input) => {
    const expense = await get().repo!.createExpense(input);
    set((s) => ({ expenses: [...s.expenses, expense] }));
    return expense;
  },

  updateExpense: async (expenseId, input) => {
    const updated = await get().repo!.updateExpense(expenseId, input);
    set((s) => ({ expenses: s.expenses.map((e) => (e.id === expenseId ? updated : e)) }));
  },

  deleteExpense: async (expenseId) => {
    await get().repo!.deleteExpense(expenseId);
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== expenseId) }));
  },

  createPhoto: async (input) => {
    const photo = await get().repo!.createPhoto(input);
    set((s) => ({ photos: [...s.photos, photo] }));
    return photo;
  },

  deletePhoto: async (photoId) => {
    await get().repo!.deletePhoto(photoId);
    set((s) => ({ photos: s.photos.filter((p) => p.id !== photoId) }));
  },

  createNote: async (input) => {
    const note = await get().repo!.createNote(input);
    set((s) => ({ notes: [...s.notes, note] }));
    return note;
  },

  updateNote: async (noteId, input) => {
    const updated = await get().repo!.updateNote(noteId, input);
    set((s) => ({ notes: s.notes.map((n) => (n.id === noteId ? updated : n)) }));
  },

  deleteNote: async (noteId) => {
    await get().repo!.deleteNote(noteId);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== noteId) }));
  },
}));
