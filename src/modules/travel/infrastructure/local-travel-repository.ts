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
import { createSeedData } from "./seed-data";

const STORAGE_KEY = "lifeos:travel:v1";

interface StoredData {
  trips: Trip[];
  itineraryItems: ItineraryItem[];
  expenses: TripExpense[];
  photos: TripPhoto[];
  notes: TripNote[];
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

function findTrip(data: StoredData, id: string): Trip {
  const trip = data.trips.find((t) => t.id === id);
  if (!trip) throw new Error(`Trip not found: ${id}`);
  return trip;
}

function findItineraryItem(data: StoredData, id: string): ItineraryItem {
  const item = data.itineraryItems.find((i) => i.id === id);
  if (!item) throw new Error(`Itinerary item not found: ${id}`);
  return item;
}

function findExpense(data: StoredData, id: string): TripExpense {
  const expense = data.expenses.find((e) => e.id === id);
  if (!expense) throw new Error(`Expense not found: ${id}`);
  return expense;
}

function findNote(data: StoredData, id: string): TripNote {
  const note = data.notes.find((n) => n.id === id);
  if (!note) throw new Error(`Note not found: ${id}`);
  return note;
}

/**
 * Browser `localStorage`-backed `TravelRepository`. Active until auth
 * exists (see docs/ROADMAP.md and src/modules/travel/README.md) — every
 * method still returns a Promise so swapping in `SupabaseTravelRepository`
 * later doesn't change any call site.
 *
 * Must only be constructed client-side (it touches `localStorage` in its
 * constructor); `application/travel-store.ts` only does so from a
 * post-mount effect, never at module scope, so it never runs during SSR.
 */
export class LocalTravelRepository implements TravelRepository {
  private data: StoredData;

  constructor() {
    const stored = loadFromStorage();
    if (stored) {
      this.data = stored;
    } else {
      const seed = createSeedData();
      this.data = {
        trips: seed.trips,
        itineraryItems: seed.itineraryItems,
        expenses: seed.expenses,
        photos: seed.photos,
        notes: seed.notes,
      };
    }
    this.persist();
  }

  private persist() {
    saveToStorage(this.data);
  }

  async listTrips(): Promise<Trip[]> {
    return structuredClone(this.data.trips);
  }

  async listItineraryItems(): Promise<ItineraryItem[]> {
    return structuredClone(this.data.itineraryItems);
  }

  async listExpenses(): Promise<TripExpense[]> {
    return structuredClone(this.data.expenses);
  }

  async listPhotos(): Promise<TripPhoto[]> {
    return structuredClone(this.data.photos);
  }

  async listNotes(): Promise<TripNote[]> {
    return structuredClone(this.data.notes);
  }

  async createTrip(input: CreateTripInput): Promise<Trip> {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: uid(),
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      coverColor: input.coverColor ?? "#6366f1",
      budget: input.budget ?? 0,
      currency: input.currency ?? "VND",
      notes: input.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };
    this.data.trips.push(trip);
    this.persist();
    return structuredClone(trip);
  }

  async updateTrip(tripId: string, input: UpdateTripInput): Promise<Trip> {
    const trip = findTrip(this.data, tripId);
    Object.assign(trip, input);
    trip.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(trip);
  }

  async deleteTrip(tripId: string): Promise<void> {
    this.data.trips = this.data.trips.filter((t) => t.id !== tripId);
    this.data.itineraryItems = this.data.itineraryItems.filter((i) => i.tripId !== tripId);
    this.data.expenses = this.data.expenses.filter((e) => e.tripId !== tripId);
    this.data.photos = this.data.photos.filter((p) => p.tripId !== tripId);
    this.data.notes = this.data.notes.filter((n) => n.tripId !== tripId);
    this.persist();
  }

  async createItineraryItem(input: CreateItineraryItemInput): Promise<ItineraryItem> {
    const now = new Date().toISOString();
    const item: ItineraryItem = {
      id: uid(),
      tripId: input.tripId,
      category: input.category,
      title: input.title,
      location: input.location ?? "",
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      startAt: input.startAt,
      endAt: input.endAt ?? null,
      notes: input.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };
    this.data.itineraryItems.push(item);
    this.persist();
    return structuredClone(item);
  }

  async updateItineraryItem(itemId: string, input: UpdateItineraryItemInput): Promise<ItineraryItem> {
    const item = findItineraryItem(this.data, itemId);
    Object.assign(item, input);
    item.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(item);
  }

  async deleteItineraryItem(itemId: string): Promise<void> {
    this.data.itineraryItems = this.data.itineraryItems.filter((i) => i.id !== itemId);
    this.persist();
  }

  async createExpense(input: CreateExpenseInput): Promise<TripExpense> {
    const now = new Date().toISOString();
    const expense: TripExpense = {
      id: uid(),
      tripId: input.tripId,
      category: input.category,
      amount: input.amount,
      currency: input.currency ?? "VND",
      note: input.note ?? "",
      spentAt: input.spentAt ?? now,
      createdAt: now,
      updatedAt: now,
    };
    this.data.expenses.push(expense);
    this.persist();
    return structuredClone(expense);
  }

  async updateExpense(expenseId: string, input: UpdateExpenseInput): Promise<TripExpense> {
    const expense = findExpense(this.data, expenseId);
    Object.assign(expense, input);
    expense.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(expense);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    this.data.expenses = this.data.expenses.filter((e) => e.id !== expenseId);
    this.persist();
  }

  async createPhoto(input: CreatePhotoInput): Promise<TripPhoto> {
    const now = new Date().toISOString();
    const photo: TripPhoto = {
      id: uid(),
      tripId: input.tripId,
      url: input.url,
      caption: input.caption ?? "",
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      takenAt: input.takenAt ?? now,
      createdAt: now,
    };
    this.data.photos.push(photo);
    this.persist();
    return structuredClone(photo);
  }

  async deletePhoto(photoId: string): Promise<void> {
    this.data.photos = this.data.photos.filter((p) => p.id !== photoId);
    this.persist();
  }

  async createNote(input: CreateNoteInput): Promise<TripNote> {
    const now = new Date().toISOString();
    const note: TripNote = {
      id: uid(),
      tripId: input.tripId,
      title: input.title ?? "",
      body: input.body,
      createdAt: now,
      updatedAt: now,
    };
    this.data.notes.push(note);
    this.persist();
    return structuredClone(note);
  }

  async updateNote(noteId: string, input: UpdateNoteInput): Promise<TripNote> {
    const note = findNote(this.data, noteId);
    Object.assign(note, input);
    note.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(note);
  }

  async deleteNote(noteId: string): Promise<void> {
    this.data.notes = this.data.notes.filter((n) => n.id !== noteId);
    this.persist();
  }
}
