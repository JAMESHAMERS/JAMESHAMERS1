import { createClient } from "@/shared/lib/supabase/client";
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

/**
 * Production `TravelRepository` implementation against
 * `supabase/migrations/0011_travel.sql`. Not currently instantiated
 * anywhere — `application/travel-store.ts` uses `LocalTravelRepository`
 * until auth exists (there's no `auth.uid()` for RLS to scope rows to
 * yet). Swapping it in later is a one-line change there, not a rewrite of
 * this file or of `presentation`.
 *
 * `createPhoto` here is also where real file upload to Supabase Storage
 * would go — `input.url` would become a signed upload followed by storing
 * the resulting storage path, mirroring `SupabaseTaskRepository.addAttachment`.
 */
export class SupabaseTravelRepository implements TravelRepository {
  private supabase = createClient();

  private async currentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("SupabaseTravelRepository requires an authenticated user.");
    return user.id;
  }

  async listTrips(): Promise<Trip[]> {
    const { data, error } = await this.supabase.from("trips").select("*").order("start_date");
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      destination: row.destination,
      startDate: row.start_date,
      endDate: row.end_date,
      coverColor: row.cover_color,
      budget: row.budget,
      currency: row.currency,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listItineraryItems(): Promise<ItineraryItem[]> {
    const { data, error } = await this.supabase.from("trip_itinerary_items").select("*").order("start_at");
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      tripId: row.trip_id,
      category: row.category,
      title: row.title,
      location: row.location,
      lat: row.lat,
      lng: row.lng,
      startAt: row.start_at,
      endAt: row.end_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listExpenses(): Promise<TripExpense[]> {
    const { data, error } = await this.supabase
      .from("trip_expenses")
      .select("*")
      .order("spent_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      tripId: row.trip_id,
      category: row.category,
      amount: row.amount,
      currency: row.currency,
      note: row.note,
      spentAt: row.spent_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listPhotos(): Promise<TripPhoto[]> {
    const { data, error } = await this.supabase
      .from("trip_photos")
      .select("*")
      .order("taken_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      tripId: row.trip_id,
      url: row.storage_path,
      caption: row.caption,
      lat: row.lat,
      lng: row.lng,
      takenAt: row.taken_at,
      createdAt: row.created_at,
    }));
  }

  async listNotes(): Promise<TripNote[]> {
    const { data, error } = await this.supabase
      .from("trip_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      tripId: row.trip_id,
      title: row.title,
      body: row.body,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async createTrip(input: CreateTripInput): Promise<Trip> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("trips")
      .insert({
        user_id: userId,
        name: input.name,
        destination: input.destination,
        start_date: input.startDate,
        end_date: input.endDate,
        cover_color: input.coverColor ?? "#6366f1",
        budget: input.budget ?? 0,
        currency: input.currency ?? "VND",
        notes: input.notes ?? "",
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      destination: data.destination,
      startDate: data.start_date,
      endDate: data.end_date,
      coverColor: data.cover_color,
      budget: data.budget,
      currency: data.currency,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateTrip(tripId: string, input: UpdateTripInput): Promise<Trip> {
    const { data, error } = await this.supabase
      .from("trips")
      .update({
        name: input.name,
        destination: input.destination,
        start_date: input.startDate,
        end_date: input.endDate,
        cover_color: input.coverColor,
        budget: input.budget,
        currency: input.currency,
        notes: input.notes,
      })
      .eq("id", tripId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      destination: data.destination,
      startDate: data.start_date,
      endDate: data.end_date,
      coverColor: data.cover_color,
      budget: data.budget,
      currency: data.currency,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteTrip(tripId: string): Promise<void> {
    // Child tables (`trip_itinerary_items`, `trip_expenses`, `trip_photos`,
    // `trip_notes`) all `on delete cascade` from `trips` — no manual cleanup.
    const { error } = await this.supabase.from("trips").delete().eq("id", tripId);
    if (error) throw error;
  }

  async createItineraryItem(input: CreateItineraryItemInput): Promise<ItineraryItem> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("trip_itinerary_items")
      .insert({
        trip_id: input.tripId,
        user_id: userId,
        category: input.category,
        title: input.title,
        location: input.location ?? "",
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        start_at: input.startAt,
        end_at: input.endAt ?? null,
        notes: input.notes ?? "",
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      category: data.category,
      title: data.title,
      location: data.location,
      lat: data.lat,
      lng: data.lng,
      startAt: data.start_at,
      endAt: data.end_at,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateItineraryItem(itemId: string, input: UpdateItineraryItemInput): Promise<ItineraryItem> {
    const { data, error } = await this.supabase
      .from("trip_itinerary_items")
      .update({
        category: input.category,
        title: input.title,
        location: input.location,
        lat: input.lat,
        lng: input.lng,
        start_at: input.startAt,
        end_at: input.endAt,
        notes: input.notes,
      })
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      category: data.category,
      title: data.title,
      location: data.location,
      lat: data.lat,
      lng: data.lng,
      startAt: data.start_at,
      endAt: data.end_at,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteItineraryItem(itemId: string): Promise<void> {
    const { error } = await this.supabase.from("trip_itinerary_items").delete().eq("id", itemId);
    if (error) throw error;
  }

  async createExpense(input: CreateExpenseInput): Promise<TripExpense> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("trip_expenses")
      .insert({
        trip_id: input.tripId,
        user_id: userId,
        category: input.category,
        amount: input.amount,
        currency: input.currency ?? "VND",
        note: input.note ?? "",
        spent_at: input.spentAt ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      note: data.note,
      spentAt: data.spent_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateExpense(expenseId: string, input: UpdateExpenseInput): Promise<TripExpense> {
    const { data, error } = await this.supabase
      .from("trip_expenses")
      .update({
        category: input.category,
        amount: input.amount,
        currency: input.currency,
        note: input.note,
        spent_at: input.spentAt,
      })
      .eq("id", expenseId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      note: data.note,
      spentAt: data.spent_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const { error } = await this.supabase.from("trip_expenses").delete().eq("id", expenseId);
    if (error) throw error;
  }

  async createPhoto(input: CreatePhotoInput): Promise<TripPhoto> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("trip_photos")
      .insert({
        trip_id: input.tripId,
        user_id: userId,
        storage_path: input.url,
        caption: input.caption ?? "",
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        taken_at: input.takenAt ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      url: data.storage_path,
      caption: data.caption,
      lat: data.lat,
      lng: data.lng,
      takenAt: data.taken_at,
      createdAt: data.created_at,
    };
  }

  async deletePhoto(photoId: string): Promise<void> {
    const { error } = await this.supabase.from("trip_photos").delete().eq("id", photoId);
    if (error) throw error;
  }

  async createNote(input: CreateNoteInput): Promise<TripNote> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("trip_notes")
      .insert({ trip_id: input.tripId, user_id: userId, title: input.title ?? "", body: input.body })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      title: data.title,
      body: data.body,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateNote(noteId: string, input: UpdateNoteInput): Promise<TripNote> {
    const { data, error } = await this.supabase
      .from("trip_notes")
      .update({ title: input.title, body: input.body })
      .eq("id", noteId)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      tripId: data.trip_id,
      title: data.title,
      body: data.body,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await this.supabase.from("trip_notes").delete().eq("id", noteId);
    if (error) throw error;
  }
}
