import type { JournalEntry, JournalPhoto, JournalTag, JournalVoiceNote, MoodLevel } from "./types";

export interface CreateEntryInput {
  title?: string;
  content?: string;
  mood?: MoodLevel | null;
  entryDate?: string;
}

export interface UpdateEntryInput {
  title?: string;
  content?: string;
  mood?: MoodLevel | null;
  entryDate?: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface CreatePhotoInput {
  entryId: string;
  url: string;
  caption?: string;
}

export interface CreateVoiceNoteInput {
  entryId: string;
  url: string;
  durationSeconds: number;
}

/**
 * Storage-agnostic contract for everything the Journal module needs to
 * persist. `LocalJournalRepository` (active today, browser-only) and
 * `SupabaseJournalRepository` (production adapter, wired in once auth
 * exists — see docs/ROADMAP.md) both implement this exactly, so
 * `application` and `presentation` never know which one is behind it.
 */
export interface JournalRepository {
  listEntries(): Promise<JournalEntry[]>;
  listTags(): Promise<JournalTag[]>;
  listPhotos(): Promise<JournalPhoto[]>;
  listVoiceNotes(): Promise<JournalVoiceNote[]>;

  createEntry(input: CreateEntryInput): Promise<JournalEntry>;
  updateEntry(entryId: string, input: UpdateEntryInput): Promise<JournalEntry>;
  deleteEntry(entryId: string): Promise<void>;
  setEntryTags(entryId: string, tagIds: string[]): Promise<JournalEntry>;

  createTag(input: CreateTagInput): Promise<JournalTag>;
  deleteTag(tagId: string): Promise<void>;

  addPhoto(input: CreatePhotoInput): Promise<JournalPhoto>;
  deletePhoto(photoId: string): Promise<void>;

  addVoiceNote(input: CreateVoiceNoteInput): Promise<JournalVoiceNote>;
  deleteVoiceNote(voiceNoteId: string): Promise<void>;
}
