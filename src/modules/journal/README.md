# journal module

Fifth full 4-layer module, built the same way as `modules/finance`,
`modules/meals`, and `modules/travel` (see their READMEs) — same
`domain/repository.ts` port + two implementations, same
Zustand-as-application-layer shape, same "runs on local storage until
auth exists" reasoning.

- `domain/types.ts` — `JournalEntry` (title/content/mood/entryDate/
  tagIds), `MoodLevel` (5-point `great`→`awful` scale, with `MOOD_SCORE`
  mapping it to 5→1 for charting), `JournalTag`, `JournalPhoto`,
  `JournalVoiceNote`.
- `domain/rules.ts` — pure functions: search/tag/mood filtering, month
  grouping for the Timeline tab, mood trend/distribution/average for the
  Mood tab, a journaling streak (consecutive days with an entry, counting
  backward from today), and `isEntryEmpty` (used to silently discard a
  freshly-created draft entry if the user closes it without writing
  anything). No framework imports.
- `domain/repository.ts` — `JournalRepository` port.
- `infrastructure/local-journal-repository.ts` — **active today.**
  `localStorage`-backed, seeded with ~3 months of realistic entries
  (including a 5-day streak leading up to today) so the Timeline and Mood
  tabs both have something to show on first visit.
- `infrastructure/supabase-journal-repository.ts` — production adapter
  against `supabase/migrations/0006_journal.sql` +
  `0012_journal_extended.sql`. Written and ready, not wired in — see
  `docs/ROADMAP.md` Phase 1.
- `application/journal-store.ts` — Zustand store; actions are thin calls
  into the injected `JournalRepository` followed by a state patch. Also
  holds UI-only state (`selectedEntryId`, search/tag/mood `filters`).
- `presentation/` — `JournalView` (top tabs: Timeline, Mood). Timeline is
  a month-grouped feed with a search/tag/mood filter bar (mirrors
  Finance's `TransactionFiltersBar`); clicking an entry — or clicking
  "New entry", which immediately creates an empty draft and opens it —
  opens `EntryDetailSheet`, the same `Sheet`-based rich-editor pattern as
  Tasks' `task-detail-sheet.tsx` (title/content `Textarea`s persisted
  `onBlur`, not on every keystroke).

## Voice notes and photos — why no upload backend

`VoiceNoteRecorder` uses the real `MediaRecorder`/`getUserMedia` browser
APIs to record audio, producing a `Blob` turned into an object URL —
mic access failure (denied permission, no device, insecure context) is
caught and shown inline rather than left to throw. `PhotoList` uses
`URL.createObjectURL` on a picked file, the same trade-off Tasks'
`AttachmentList` and Travel's `PhotoDialog` already made: neither
survives a reload, since there's no file storage backend yet. Real
upload is `SupabaseJournalRepository.addPhoto`/`addVoiceNote`'s job once
auth/storage exist.

## Why new entries auto-delete if left blank

Clicking "New entry" creates the row immediately (so the editor has
something to bind to) rather than opening a separate create dialog first
— journal entries are content-heavy, so jumping straight into the same
full-size editor used for editing is a better fit than a small modal.
The trade-off is a stray empty entry if the user opens the sheet and
closes it without writing anything; `EntryDetailSheet`'s `onOpenChange`
checks `isEntryEmpty` (no title, content, mood, tags, photos, or voice
notes) and deletes the draft silently in that case, so the Timeline never
shows blank cards.
