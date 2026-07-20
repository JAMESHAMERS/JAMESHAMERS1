import { createClient } from "@/shared/lib/supabase/client";
import type { Database } from "@/shared/types/database.types";
import type {
  CreateEntryInput,
  CreatePhotoInput,
  CreateTagInput,
  CreateVoiceNoteInput,
  JournalRepository,
  UpdateEntryInput,
} from "../domain/repository";
import type { JournalEntry, JournalPhoto, JournalTag, JournalVoiceNote, MoodLevel } from "../domain/types";

type EntryRow = Database["public"]["Tables"]["journal_entries"]["Row"];

type EntryWithTags = EntryRow & { journal_entry_tags: { tag_id: string }[] | null };

function toEntry(row: EntryWithTags): JournalEntry {
  return {
    id: row.id,
    title: row.title ?? "",
    content: row.content,
    mood: row.mood as MoodLevel | null,
    entryDate: row.entry_date,
    tagIds: (row.journal_entry_tags ?? []).map((t) => t.tag_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Production `JournalRepository` implementation against
 * `supabase/migrations/0006_journal.sql` + `0012_journal_extended.sql`.
 * Not currently instantiated anywhere — `application/journal-store.ts`
 * uses `LocalJournalRepository` until auth exists (there's no
 * `auth.uid()` for RLS to scope rows to yet). Swapping it in later is a
 * one-line change there, not a rewrite of this file or of `presentation`.
 *
 * `addPhoto`/`addVoiceNote` are also where real file upload to Supabase
 * Storage would go — `input.url` would become a signed upload followed by
 * storing the resulting storage path, mirroring
 * `SupabaseTaskRepository.addAttachment`.
 */
export class SupabaseJournalRepository implements JournalRepository {
  private supabase = createClient();

  private readonly selectWithTags = "*, journal_entry_tags(tag_id)";

  private async currentUserId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("SupabaseJournalRepository requires an authenticated user.");
    return user.id;
  }

  async listEntries(): Promise<JournalEntry[]> {
    const { data, error } = await this.supabase
      .from("journal_entries")
      .select(this.selectWithTags)
      .is("deleted_at", null)
      .order("entry_date", { ascending: false });
    if (error) throw error;
    return (data as unknown as EntryWithTags[]).map(toEntry);
  }

  async listTags(): Promise<JournalTag[]> {
    const { data, error } = await this.supabase.from("journal_tags").select("*").order("name");
    if (error) throw error;
    return data.map((row) => ({ id: row.id, name: row.name, color: row.color }));
  }

  async listPhotos(): Promise<JournalPhoto[]> {
    const { data, error } = await this.supabase
      .from("journal_entry_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      entryId: row.entry_id,
      url: row.storage_path,
      caption: row.caption,
      createdAt: row.created_at,
    }));
  }

  async listVoiceNotes(): Promise<JournalVoiceNote[]> {
    const { data, error } = await this.supabase
      .from("journal_entry_voice_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      entryId: row.entry_id,
      url: row.storage_path,
      durationSeconds: row.duration_seconds,
      createdAt: row.created_at,
    }));
  }

  async createEntry(input: CreateEntryInput): Promise<JournalEntry> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        title: input.title ?? "",
        content: input.content ?? "",
        mood: input.mood ?? null,
        entry_date: input.entryDate ?? new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();
    if (error) throw error;
    return toEntry({ ...data, journal_entry_tags: [] });
  }

  async updateEntry(entryId: string, input: UpdateEntryInput): Promise<JournalEntry> {
    const { data, error } = await this.supabase
      .from("journal_entries")
      .update({ title: input.title, content: input.content, mood: input.mood, entry_date: input.entryDate })
      .eq("id", entryId)
      .select(this.selectWithTags)
      .single();
    if (error) throw error;
    return toEntry(data as unknown as EntryWithTags);
  }

  async deleteEntry(entryId: string): Promise<void> {
    const { error } = await this.supabase.from("journal_entries").delete().eq("id", entryId);
    if (error) throw error;
  }

  async setEntryTags(entryId: string, tagIds: string[]): Promise<JournalEntry> {
    const userId = await this.currentUserId();
    const { error: deleteError } = await this.supabase
      .from("journal_entry_tags")
      .delete()
      .eq("entry_id", entryId);
    if (deleteError) throw deleteError;

    if (tagIds.length > 0) {
      const { error: insertError } = await this.supabase
        .from("journal_entry_tags")
        .insert(tagIds.map((tagId) => ({ entry_id: entryId, tag_id: tagId, user_id: userId })));
      if (insertError) throw insertError;
    }

    const { data, error } = await this.supabase
      .from("journal_entries")
      .select(this.selectWithTags)
      .eq("id", entryId)
      .single();
    if (error) throw error;
    return toEntry(data as unknown as EntryWithTags);
  }

  async createTag(input: CreateTagInput): Promise<JournalTag> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("journal_tags")
      .insert({ user_id: userId, name: input.name, color: input.color ?? "#6366f1" })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, name: data.name, color: data.color };
  }

  async deleteTag(tagId: string): Promise<void> {
    const { error } = await this.supabase.from("journal_tags").delete().eq("id", tagId);
    if (error) throw error;
  }

  async addPhoto(input: CreatePhotoInput): Promise<JournalPhoto> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("journal_entry_photos")
      .insert({ entry_id: input.entryId, user_id: userId, storage_path: input.url, caption: input.caption ?? "" })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      entryId: data.entry_id,
      url: data.storage_path,
      caption: data.caption,
      createdAt: data.created_at,
    };
  }

  async deletePhoto(photoId: string): Promise<void> {
    const { error } = await this.supabase.from("journal_entry_photos").delete().eq("id", photoId);
    if (error) throw error;
  }

  async addVoiceNote(input: CreateVoiceNoteInput): Promise<JournalVoiceNote> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("journal_entry_voice_notes")
      .insert({
        entry_id: input.entryId,
        user_id: userId,
        storage_path: input.url,
        duration_seconds: input.durationSeconds,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      entryId: data.entry_id,
      url: data.storage_path,
      durationSeconds: data.duration_seconds,
      createdAt: data.created_at,
    };
  }

  async deleteVoiceNote(voiceNoteId: string): Promise<void> {
    const { error } = await this.supabase.from("journal_entry_voice_notes").delete().eq("id", voiceNoteId);
    if (error) throw error;
  }
}
