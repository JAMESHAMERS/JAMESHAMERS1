export type MoodLevel = "great" | "good" | "okay" | "bad" | "awful";

export const MOOD_LEVELS: MoodLevel[] = ["great", "good", "okay", "bad", "awful"];

/** 5 (great) down to 1 (awful) — used for trend charts and averages. */
export const MOOD_SCORE: Record<MoodLevel, number> = {
  great: 5,
  good: 4,
  okay: 3,
  bad: 2,
  awful: 1,
};

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodLevel | null;
  /** Date-only (YYYY-MM-DD) — the day this entry is *about*, not necessarily when it was typed. */
  entryDate: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalTag {
  id: string;
  name: string;
  color: string;
}

export interface JournalPhoto {
  id: string;
  entryId: string;
  /** Object/data URL — see LocalJournalRepository for why this doesn't survive a reload, same as Travel's trip photos. */
  url: string;
  caption: string;
  createdAt: string;
}

export interface JournalVoiceNote {
  id: string;
  entryId: string;
  /** Object URL for the recorded audio `Blob` — same non-persisting trade-off as photos. */
  url: string;
  durationSeconds: number;
  createdAt: string;
}

export const TAG_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];

export interface EntryFilters {
  search: string;
  tagIds: string[];
  moods: MoodLevel[];
}

export const EMPTY_FILTERS: EntryFilters = {
  search: "",
  tagIds: [],
  moods: [],
};
