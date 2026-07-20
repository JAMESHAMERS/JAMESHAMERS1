import type { JournalEntry, JournalPhoto, JournalTag, MoodLevel } from "../domain/types";

/**
 * Inline SVG data URI so seed photos render without any network fetch or
 * uploaded file — unlike user-added photos (see LocalJournalRepository),
 * these persist in `localStorage` across reloads since they're plain
 * text, not a `blob:` object URL.
 */
function placeholderPhoto(color: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="480" height="320" fill="${color}"/><text x="240" y="168" font-family="system-ui,sans-serif" font-size="26" fill="white" text-anchor="middle" opacity="0.9">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TAG_SEED: Omit<JournalTag, "id">[] = [
  { name: "Work", color: "#0ea5e9" },
  { name: "Family", color: "#ec4899" },
  { name: "Health", color: "#22c55e" },
  { name: "Gratitude", color: "#f59e0b" },
  { name: "Ideas", color: "#8b5cf6" },
];

interface EntrySeed {
  dayOffset: number;
  hour: number;
  minute: number;
  title: string;
  content: string;
  mood: MoodLevel;
  tagNames: string[];
  photo?: { color: string; label: string; caption: string };
}

const ENTRY_SEEDS: EntrySeed[] = [
  {
    dayOffset: 0,
    hour: 21,
    minute: 10,
    title: "A good, ordinary day",
    content:
      "Nothing dramatic happened today and that felt nice for once. Finished the quarterly report ahead of schedule, went for a short walk after dinner. Small wins count too.",
    mood: "good",
    tagNames: ["Work"],
  },
  {
    dayOffset: 1,
    hour: 22,
    minute: 5,
    title: "Rough start, better finish",
    content:
      "Woke up late and missed the standup, which threw off my whole morning. Managed to turn it around after lunch — pair-programmed through the tricky bug that's been blocking the release.",
    mood: "okay",
    tagNames: ["Work"],
  },
  {
    dayOffset: 2,
    hour: 20,
    minute: 40,
    title: "Dinner with the family",
    content:
      "Mom's birthday dinner tonight. Everyone made it, even my brother who's usually working late. Grateful for evenings like this — they don't happen often enough.",
    mood: "great",
    tagNames: ["Family", "Gratitude"],
    photo: { color: "#ec4899", label: "Family dinner", caption: "Everyone finally in one place" },
  },
  {
    dayOffset: 3,
    hour: 19,
    minute: 15,
    title: "Long run, clear head",
    content:
      "Pushed for 10k this morning instead of my usual 5 — legs are sore but my head feels so much clearer. Need to remember this feeling next time I want to skip a run.",
    mood: "good",
    tagNames: ["Health"],
  },
  {
    dayOffset: 4,
    hour: 23,
    minute: 0,
    title: "Idea for the side project",
    content:
      "Couldn't sleep, kept thinking about a simpler data model for the side project. Sketched it out in my notes app — might actually be buildable in a weekend.",
    mood: "good",
    tagNames: ["Ideas"],
  },
  {
    dayOffset: 9,
    hour: 21,
    minute: 30,
    title: "Overdue catch-up",
    content:
      "Called an old friend I hadn't talked to in months. We picked up right where we left off — those are the best kinds of friendships.",
    mood: "great",
    tagNames: ["Gratitude"],
  },
  {
    dayOffset: 12,
    hour: 22,
    minute: 20,
    title: "Stressful release day",
    content:
      "Deploy went sideways twice before we caught the config issue. Long day, everyone's tired. Ordering the team lunch tomorrow to say thanks.",
    mood: "bad",
    tagNames: ["Work"],
  },
  {
    dayOffset: 15,
    hour: 20,
    minute: 0,
    title: "Sunday reset",
    content:
      "Cleaned the apartment, meal-prepped for the week, read for an hour on the balcony. Exactly the kind of slow Sunday I needed.",
    mood: "good",
    tagNames: ["Health"],
  },
  {
    dayOffset: 19,
    hour: 22,
    minute: 45,
    title: "Not my best day",
    content:
      "Everything felt heavier than it should have today. Nothing specific went wrong, just one of those low-energy stretches. Going to bed early.",
    mood: "awful",
    tagNames: [],
  },
  {
    dayOffset: 24,
    hour: 18,
    minute: 30,
    title: "Weekend hike",
    content:
      "Finally did the trail we'd been talking about for weeks. The view from the top was worth every uphill step.",
    mood: "great",
    tagNames: ["Health", "Gratitude"],
    photo: { color: "#22c55e", label: "Trail summit", caption: "Worth the climb" },
  },
  {
    dayOffset: 30,
    hour: 21,
    minute: 0,
    title: "Slow news day",
    content: "Fairly uneventful. Caught up on reading, did laundry, nothing much to report.",
    mood: "okay",
    tagNames: [],
  },
];

function isoAt(dayOffset: number, hour: number, minute: number, now: Date) {
  const d = new Date(now);
  d.setDate(d.getDate() - dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateKeyAt(dayOffset: number, now: Date) {
  const d = new Date(now);
  d.setDate(d.getDate() - dayOffset);
  return d.toISOString().slice(0, 10);
}

/**
 * ~3 months of realistic journal history — a 5-day streak leading up to
 * today plus scattered earlier entries — so the Timeline and Mood tabs
 * both have something meaningful to render on first visit, not just an
 * empty state.
 */
export function createSeedData(): {
  entries: JournalEntry[];
  tags: JournalTag[];
  photos: JournalPhoto[];
} {
  const now = new Date();

  const tags: JournalTag[] = TAG_SEED.map((t, i) => ({ id: `tag-${i}`, ...t }));
  const byName = (name: string) => tags.find((t) => t.name === name)!;

  const entries: JournalEntry[] = [];
  const photos: JournalPhoto[] = [];
  let entryCounter = 0;
  let photoCounter = 0;

  for (const seed of ENTRY_SEEDS) {
    const createdAt = isoAt(seed.dayOffset, seed.hour, seed.minute, now);
    const entry: JournalEntry = {
      id: `seed-entry-${entryCounter++}`,
      title: seed.title,
      content: seed.content,
      mood: seed.mood,
      entryDate: dateKeyAt(seed.dayOffset, now),
      tagIds: seed.tagNames.map((name) => byName(name).id),
      createdAt,
      updatedAt: createdAt,
    };
    entries.push(entry);

    if (seed.photo) {
      photos.push({
        id: `seed-photo-${photoCounter++}`,
        entryId: entry.id,
        url: placeholderPhoto(seed.photo.color, seed.photo.label),
        caption: seed.photo.caption,
        createdAt,
      });
    }
  }

  return { entries, tags, photos };
}
