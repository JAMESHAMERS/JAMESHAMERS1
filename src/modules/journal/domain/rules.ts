import type { EntryFilters, JournalEntry, JournalPhoto, JournalVoiceNote, MoodLevel } from "./types";
import { MOOD_SCORE } from "./types";

/** Pure business rules — no framework, no I/O, trivially unit-testable. */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function dayKeyOf(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function monthKeyOf(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function sortEntriesByDateDesc(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => {
    const dateCompare = b.entryDate.localeCompare(a.entryDate);
    return dateCompare !== 0 ? dateCompare : b.createdAt.localeCompare(a.createdAt);
  });
}

export function matchesFilters(entry: JournalEntry, filters: EntryFilters) {
  const search = filters.search.trim().toLowerCase();
  if (search) {
    const haystack = `${entry.title} ${entry.content}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  if (filters.tagIds.length && !filters.tagIds.some((id) => entry.tagIds.includes(id))) return false;
  if (filters.moods.length && (!entry.mood || !filters.moods.includes(entry.mood))) return false;
  return true;
}

export function filterEntries(entries: JournalEntry[], filters: EntryFilters): JournalEntry[] {
  return entries.filter((e) => matchesFilters(e, filters));
}

export interface MonthGroup {
  monthKey: string;
  monthDate: Date;
  entries: JournalEntry[];
}

/** Newest-month-first groups, each holding its entries newest-first — the Timeline tab's section list. */
export function groupEntriesByMonth(entries: JournalEntry[]): MonthGroup[] {
  const sorted = sortEntriesByDateDesc(entries);
  const map = new Map<string, JournalEntry[]>();
  for (const entry of sorted) {
    const key = monthKeyOf(new Date(entry.entryDate));
    map.set(key, [...(map.get(key) ?? []), entry]);
  }
  return Array.from(map.entries()).map(([monthKey, monthEntries]) => ({
    monthKey,
    monthDate: new Date(monthEntries[0].entryDate),
    entries: monthEntries,
  }));
}

/** Oldest-first array of `Date` for the last `count` days, including `from`. */
export function lastDays(count: number, from: Date = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const offset = count - 1 - i;
    const d = new Date(from);
    d.setDate(d.getDate() - offset);
    return d;
  });
}

export interface MoodTrendPoint {
  dayKey: string;
  date: Date;
  score: number | null;
  mood: MoodLevel | null;
}

/** One point per day; when a day has multiple entries, the last one logged wins. */
export function moodTrend(entries: JournalEntry[], days: Date[]): MoodTrendPoint[] {
  const byDay = new Map<string, JournalEntry>();
  for (const entry of [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    byDay.set(entry.entryDate, entry);
  }
  return days.map((date) => {
    const dayKey = dayKeyOf(date);
    const entry = byDay.get(dayKey);
    const mood = entry?.mood ?? null;
    return { dayKey, date, mood, score: mood ? MOOD_SCORE[mood] : null };
  });
}

export interface MoodCount {
  mood: MoodLevel;
  count: number;
}

export function moodDistribution(entries: JournalEntry[]): MoodCount[] {
  const counts = new Map<MoodLevel, number>();
  for (const entry of entries) {
    if (!entry.mood) continue;
    counts.set(entry.mood, (counts.get(entry.mood) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count);
}

export function averageMoodScore(entries: JournalEntry[]): number | null {
  const scored = entries.filter((e) => e.mood);
  if (scored.length === 0) return null;
  const total = scored.reduce((sum, e) => sum + MOOD_SCORE[e.mood!], 0);
  return total / scored.length;
}

/** Consecutive days with at least one entry, counting backward from `from` (today by default). */
export function journalingStreak(entries: JournalEntry[], from: Date = new Date()): number {
  const days = new Set(entries.map((e) => e.entryDate));
  let streak = 0;
  const cursor = new Date(from);
  while (days.has(dayKeyOf(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function isEntryEmpty(entry: JournalEntry, photos: JournalPhoto[], voiceNotes: JournalVoiceNote[]) {
  return (
    !entry.title.trim() &&
    !entry.content.trim() &&
    !entry.mood &&
    entry.tagIds.length === 0 &&
    !photos.some((p) => p.entryId === entry.id) &&
    !voiceNotes.some((v) => v.entryId === entry.id)
  );
}
