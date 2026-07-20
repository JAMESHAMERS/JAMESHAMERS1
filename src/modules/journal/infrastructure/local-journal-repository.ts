import type {
  CreateEntryInput,
  CreatePhotoInput,
  CreateTagInput,
  CreateVoiceNoteInput,
  JournalRepository,
  UpdateEntryInput,
} from "../domain/repository";
import type { JournalEntry, JournalPhoto, JournalTag, JournalVoiceNote } from "../domain/types";
import { createSeedData } from "./seed-data";

const STORAGE_KEY = "lifeos:journal:v1";

interface StoredData {
  entries: JournalEntry[];
  tags: JournalTag[];
  photos: JournalPhoto[];
  voiceNotes: JournalVoiceNote[];
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

function findEntry(data: StoredData, id: string): JournalEntry {
  const entry = data.entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Journal entry not found: ${id}`);
  return entry;
}

/**
 * Browser `localStorage`-backed `JournalRepository`. Active until auth
 * exists (see docs/ROADMAP.md and src/modules/journal/README.md) — every
 * method still returns a Promise so swapping in `SupabaseJournalRepository`
 * later doesn't change any call site.
 *
 * Must only be constructed client-side (it touches `localStorage` in its
 * constructor); `application/journal-store.ts` only does so from a
 * post-mount effect, never at module scope, so it never runs during SSR.
 */
export class LocalJournalRepository implements JournalRepository {
  private data: StoredData;

  constructor() {
    const stored = loadFromStorage();
    if (stored) {
      this.data = { ...stored, voiceNotes: stored.voiceNotes ?? [] };
    } else {
      const seed = createSeedData();
      this.data = { entries: seed.entries, tags: seed.tags, photos: seed.photos, voiceNotes: [] };
    }
    this.persist();
  }

  private persist() {
    saveToStorage(this.data);
  }

  async listEntries(): Promise<JournalEntry[]> {
    return structuredClone(this.data.entries);
  }

  async listTags(): Promise<JournalTag[]> {
    return structuredClone(this.data.tags);
  }

  async listPhotos(): Promise<JournalPhoto[]> {
    return structuredClone(this.data.photos);
  }

  async listVoiceNotes(): Promise<JournalVoiceNote[]> {
    return structuredClone(this.data.voiceNotes);
  }

  async createEntry(input: CreateEntryInput): Promise<JournalEntry> {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: uid(),
      title: input.title ?? "",
      content: input.content ?? "",
      mood: input.mood ?? null,
      entryDate: input.entryDate ?? now.slice(0, 10),
      tagIds: [],
      createdAt: now,
      updatedAt: now,
    };
    this.data.entries.push(entry);
    this.persist();
    return structuredClone(entry);
  }

  async updateEntry(entryId: string, input: UpdateEntryInput): Promise<JournalEntry> {
    const entry = findEntry(this.data, entryId);
    Object.assign(entry, input);
    entry.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(entry);
  }

  async deleteEntry(entryId: string): Promise<void> {
    this.data.entries = this.data.entries.filter((e) => e.id !== entryId);
    this.data.photos = this.data.photos.filter((p) => p.entryId !== entryId);
    this.data.voiceNotes = this.data.voiceNotes.filter((v) => v.entryId !== entryId);
    this.persist();
  }

  async setEntryTags(entryId: string, tagIds: string[]): Promise<JournalEntry> {
    const entry = findEntry(this.data, entryId);
    entry.tagIds = tagIds;
    entry.updatedAt = new Date().toISOString();
    this.persist();
    return structuredClone(entry);
  }

  async createTag(input: CreateTagInput): Promise<JournalTag> {
    const tag: JournalTag = { id: uid(), name: input.name, color: input.color ?? "#6366f1" };
    this.data.tags.push(tag);
    this.persist();
    return structuredClone(tag);
  }

  async deleteTag(tagId: string): Promise<void> {
    this.data.tags = this.data.tags.filter((t) => t.id !== tagId);
    for (const entry of this.data.entries) {
      entry.tagIds = entry.tagIds.filter((id) => id !== tagId);
    }
    this.persist();
  }

  async addPhoto(input: CreatePhotoInput): Promise<JournalPhoto> {
    const photo: JournalPhoto = {
      id: uid(),
      entryId: input.entryId,
      url: input.url,
      caption: input.caption ?? "",
      createdAt: new Date().toISOString(),
    };
    this.data.photos.push(photo);
    this.persist();
    return structuredClone(photo);
  }

  async deletePhoto(photoId: string): Promise<void> {
    this.data.photos = this.data.photos.filter((p) => p.id !== photoId);
    this.persist();
  }

  async addVoiceNote(input: CreateVoiceNoteInput): Promise<JournalVoiceNote> {
    const voiceNote: JournalVoiceNote = {
      id: uid(),
      entryId: input.entryId,
      url: input.url,
      durationSeconds: input.durationSeconds,
      createdAt: new Date().toISOString(),
    };
    this.data.voiceNotes.push(voiceNote);
    this.persist();
    return structuredClone(voiceNote);
  }

  async deleteVoiceNote(voiceNoteId: string): Promise<void> {
    this.data.voiceNotes = this.data.voiceNotes.filter((v) => v.id !== voiceNoteId);
    this.persist();
  }
}
