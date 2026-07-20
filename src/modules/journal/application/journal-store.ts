import { create } from "zustand";

import type {
  CreateEntryInput,
  CreatePhotoInput,
  CreateTagInput,
  CreateVoiceNoteInput,
  JournalRepository,
  UpdateEntryInput,
} from "../domain/repository";
import type { EntryFilters, JournalEntry, JournalPhoto, JournalTag, JournalVoiceNote } from "../domain/types";
import { EMPTY_FILTERS } from "../domain/types";
import { LocalJournalRepository } from "../infrastructure/local-journal-repository";

export type JournalTab = "timeline" | "mood";

interface JournalStoreState {
  repo: JournalRepository | null;
  entries: JournalEntry[];
  tags: JournalTag[];
  photos: JournalPhoto[];
  voiceNotes: JournalVoiceNote[];
  tab: JournalTab;
  filters: EntryFilters;
  selectedEntryId: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setTab: (tab: JournalTab) => void;
  setFilters: (patch: Partial<EntryFilters>) => void;
  openEntry: (entryId: string) => void;
  closeEntry: () => void;

  createEntry: (input: CreateEntryInput) => Promise<JournalEntry>;
  updateEntry: (entryId: string, input: UpdateEntryInput) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  setEntryTags: (entryId: string, tagIds: string[]) => Promise<void>;

  createTag: (input: CreateTagInput) => Promise<JournalTag>;
  deleteTag: (tagId: string) => Promise<void>;

  addPhoto: (input: CreatePhotoInput) => Promise<JournalPhoto>;
  deletePhoto: (photoId: string) => Promise<void>;

  addVoiceNote: (input: CreateVoiceNoteInput) => Promise<JournalVoiceNote>;
  deleteVoiceNote: (voiceNoteId: string) => Promise<void>;
}

/**
 * The "application" layer for the Journal module, same shape as
 * `modules/finance/application/finance-store.ts`: each action is a thin
 * call into the injected `JournalRepository` followed by a local state
 * patch. `presentation` only ever calls these actions.
 */
export const useJournalStore = create<JournalStoreState>((set, get) => ({
  repo: null,
  entries: [],
  tags: [],
  photos: [],
  voiceNotes: [],
  tab: "timeline",
  filters: EMPTY_FILTERS,
  selectedEntryId: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    // Constructed here, not at module scope — see finance-store.ts for why.
    const repo = new LocalJournalRepository();
    const [entries, tags, photos, voiceNotes] = await Promise.all([
      repo.listEntries(),
      repo.listTags(),
      repo.listPhotos(),
      repo.listVoiceNotes(),
    ]);
    set({ repo, entries, tags, photos, voiceNotes, hydrated: true });
  },

  setTab: (tab) => set({ tab }),
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  openEntry: (entryId) => set({ selectedEntryId: entryId }),
  closeEntry: () => set({ selectedEntryId: null }),

  createEntry: async (input) => {
    const entry = await get().repo!.createEntry(input);
    set((s) => ({ entries: [...s.entries, entry] }));
    return entry;
  },

  updateEntry: async (entryId, input) => {
    const updated = await get().repo!.updateEntry(entryId, input);
    set((s) => ({ entries: s.entries.map((e) => (e.id === entryId ? updated : e)) }));
  },

  deleteEntry: async (entryId) => {
    await get().repo!.deleteEntry(entryId);
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== entryId),
      photos: s.photos.filter((p) => p.entryId !== entryId),
      voiceNotes: s.voiceNotes.filter((v) => v.entryId !== entryId),
      selectedEntryId: s.selectedEntryId === entryId ? null : s.selectedEntryId,
    }));
  },

  setEntryTags: async (entryId, tagIds) => {
    const updated = await get().repo!.setEntryTags(entryId, tagIds);
    set((s) => ({ entries: s.entries.map((e) => (e.id === entryId ? updated : e)) }));
  },

  createTag: async (input) => {
    const tag = await get().repo!.createTag(input);
    set((s) => ({ tags: [...s.tags, tag] }));
    return tag;
  },

  deleteTag: async (tagId) => {
    await get().repo!.deleteTag(tagId);
    set((s) => ({
      tags: s.tags.filter((t) => t.id !== tagId),
      entries: s.entries.map((e) => ({ ...e, tagIds: e.tagIds.filter((id) => id !== tagId) })),
    }));
  },

  addPhoto: async (input) => {
    const photo = await get().repo!.addPhoto(input);
    set((s) => ({ photos: [...s.photos, photo] }));
    return photo;
  },

  deletePhoto: async (photoId) => {
    await get().repo!.deletePhoto(photoId);
    set((s) => ({ photos: s.photos.filter((p) => p.id !== photoId) }));
  },

  addVoiceNote: async (input) => {
    const voiceNote = await get().repo!.addVoiceNote(input);
    set((s) => ({ voiceNotes: [...s.voiceNotes, voiceNote] }));
    return voiceNote;
  },

  deleteVoiceNote: async (voiceNoteId) => {
    await get().repo!.deleteVoiceNote(voiceNoteId);
    set((s) => ({ voiceNotes: s.voiceNotes.filter((v) => v.id !== voiceNoteId) }));
  },
}));
