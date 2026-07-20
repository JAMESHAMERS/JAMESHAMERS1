# Development Roadmap

## Phase 0 — Foundation (this work)

- [x] Next.js 16 / React 19 / TypeScript project scaffold
- [x] Feature-sliced Clean Architecture folder structure (`modules/`, `shared/`)
- [x] Design system: Tailwind v4 tokens, shadcn/ui component library
- [x] Dark/light theme system (`next-themes` + `dark:` variant repoint)
- [x] Vietnamese/English i18n (next-intl, locale-prefixed routing)
- [x] Navigation shell: responsive sidebar/topbar, route groups
- [x] Database schema for all planned modules, with RLS from the start
- [x] Supabase client infrastructure (browser + server adapters)

Explicitly out of scope for this phase: authentication, any module's real
CRUD, data fetching, automated tests. The shell has module-scaffold pages
(`EmptyState`) instead.

## Phase 1 — Auth & account

- Supabase Auth (email/password + at least one OAuth provider).
- Wire `src/shared/lib/supabase/server.ts` session refresh into `proxy.ts`.
- Replace the static topbar avatar with a real session-aware user menu.
- Persist `profiles.theme` / `profiles.locale` on change instead of
  client-only state (promotes `settings` to a full 4-layer module).
- Route protection for `(dashboard)` — redirect unauthenticated users to a
  sign-in page under `(marketing)`.

## Phase 2 — First vertical module: Tasks ✅

Built ahead of Phase 1 (auth): with no `auth.uid()` yet, `SupabaseTaskRepository`
can't authenticate, so the module runs on a `localStorage`-backed
`LocalTaskRepository` behind the same `TaskRepository` port — see
`src/modules/tasks/README.md` for the swap plan once auth lands.

- [x] `domain` — `Task`/`Subtask`/`Label`/`Comment`/`Attachment`, pure rules
  (overdue, grouping, filtering, progress), `TaskRepository` port.
- [x] `infrastructure` — `LocalTaskRepository` (active),
  `SupabaseTaskRepository` (written, not wired in yet).
- [x] `application` — Zustand store (`task-store.ts`) as the use-case layer.
- [x] `presentation` — Kanban (drag-and-drop via `@dnd-kit`, cross-column +
  reorder), List (grouped, sortable), Calendar (month grid, dot indicators
  on mobile) views; task detail sheet (subtasks, labels, comments,
  attachments, due date, reminder); create dialog; filters (search,
  priority, labels).
- [x] Schema extended (`0008_tasks_extended.sql`): labels, task_labels,
  subtasks, task_comments, task_attachments, plus `position`/`reminder_at`
  on `tasks`.
- [ ] First real usage of `StatCard` (open/overdue counts) on the Overview
  page — still pending, now that real task data exists to summarize.
- [ ] Wire `SupabaseTaskRepository` in once Phase 1 ships (swap the one
  `new LocalTaskRepository()` call in `task-store.ts`).

## Phase 3 — Habits

- Streak calculation as a pure `domain` function (testable without a DB).
- Daily check-in UI, calendar/heatmap view.
- Overview page gains a habits summary section.

## Phase 4 — Goals

- Progress tracking, optional linkage to tasks/habits (a goal made of
  tasks) — data-model decision to make once Tasks/Habits are real and the
  linkage need is concrete, not guessed at now.

## Phase 5 — Finance ✅

Built out of order (before Habits/Goals) for the same reason Tasks jumped
ahead of auth in Phase 2 — it was requested next. Same pattern as
`modules/tasks`: full 4 layers, `LocalFinanceRepository` active today,
`SupabaseFinanceRepository` written and waiting on Phase 1 auth.

- [x] `domain` — `Transaction` (income/expense/saving/investment),
  `Category` (user-defined, scoped to a type), `Budget`; pure rules
  (monthly breakdown, category breakdown, budget progress, search/filter).
- [x] `infrastructure` — `LocalTaskRepository`-equivalent
  `LocalFinanceRepository` seeded with ~4 months of realistic transactions;
  `SupabaseFinanceRepository` (not wired in).
- [x] `application` — Zustand store (`finance-store.ts`).
- [x] `presentation` — four tabs: Overview (stat cards, cash-flow chart,
  expense donut, recent transactions), Transactions (search + type/category
  filters, add/edit/delete), Budgets (monthly progress per category),
  Reports (month picker, income/expense/saving/investment bar chart,
  category donut, 6-month cash-flow trend).
- [x] Schema extended (`0009_finance_extended.sql`): `categories` table,
  `saving`/`investment` added to `transactions.type`, free-text `category`
  columns on `transactions`/`budgets` replaced with a `category_id` FK.
- [x] First real use of the `chart-accent` token pattern for finance charts
  (income/expense use the semantic `success`/`destructive` tokens instead
  of `chart-1..5`, so the color stays meaningful — not just decorative —
  across both themes).

## Phase 7 — Meals ✅

Built out of order (before Habits/Goals/Journal) for the same reason
Tasks and Finance jumped the queue — it was requested next. Same pattern
as `modules/finance`: full 4 layers, `LocalMealsRepository` active today,
`SupabaseMealsRepository` written and waiting on Phase 1 auth.

- [x] `domain` — `MealEntry` (breakfast/lunch/dinner/snack, calories +
  protein/carbs/fat), `WaterEntry` (ml), `NutritionGoals` (daily targets);
  pure rules (day/weekly summaries and averages, macro-to-calorie
  conversion, goal progress).
- [x] `infrastructure` — `LocalMealsRepository` seeded with ~1 week of
  realistic meals and water intake; `SupabaseMealsRepository` (not wired
  in).
- [x] `application` — Zustand store (`meals-store.ts`).
- [x] `presentation` — two tabs: Today (day navigator, calorie ring,
  macro/water progress, add/edit/delete meal entries per meal-type
  section, quick-add water), Weekly (trailing 7-day averages, calories vs.
  goal bar chart, macro-split donut, water vs. goal bar chart).
- [x] New schema (`0010_meals.sql`): `meal_entries`, `water_entries`,
  `nutrition_goals` tables, all with RLS.
- [x] First use of `ReferenceLine` (recharts) in this codebase — the
  dashed goal line on the Weekly tab's calorie and water bar charts.

## Phase 8 — Travel ✅

Built out of order (before Habits/Goals/Journal) for the same reason
Tasks, Finance, and Meals jumped the queue — it was requested next. Same
pattern as `modules/finance`: full 4 layers, `LocalTravelRepository`
active today, `SupabaseTravelRepository` written and waiting on Phase 1
auth.

- [x] `domain` — `Trip` (name/destination/date range/budget/cover color),
  `ItineraryItem` (flight/hotel/activity/food/transport/other, optional
  coordinates), `TripExpense` (transport/accommodation/food/activities/
  shopping/other), `TripPhoto`, `TripNote`; pure rules (derived trip
  status, budget progress, category breakdowns, day-grouping, a merged
  itinerary+expense+photo+note timeline feed, global stats/spend trend).
- [x] `infrastructure` — `LocalTravelRepository` seeded with 3 trips (one
  completed, one ongoing, one upcoming), cascade-deleting a trip's
  itinerary/expenses/photos/notes; `SupabaseTravelRepository` (not wired
  in).
- [x] `application` — Zustand store (`travel-store.ts`), including which
  trip's detail sheet is open and which of its 6 sub-tabs is active.
- [x] `presentation` — top tabs Trips (card grid) and Statistics
  (spend-by-category donut, spend trend, trip/day/destination counts);
  clicking a trip card opens `TripDetailSheet`, a `Sheet` with its own
  nested tabs for Itinerary, Expenses, Photos, Map (custom SVG pin
  visualization, no external tile provider), Notes, and Timeline.
- [x] New schema (`0011_travel.sql`): `trips`, `trip_itinerary_items`,
  `trip_expenses`, `trip_photos`, `trip_notes` tables, all with RLS and
  `on delete cascade` from `trips`.
- [x] First module to nest a second `Tabs` instance inside a `Sheet`
  (Tasks' detail sheet is one long scroll; Travel's has too much content
  per trip for that to work).

## Phase 9 — Journal ✅

Built out of order (before Habits/Goals) for the same reason Tasks,
Finance, Meals, and Travel jumped the queue — it was requested next. Same
pattern as `modules/finance`: full 4 layers, `LocalJournalRepository`
active today, `SupabaseJournalRepository` written and waiting on Phase 1
auth. Reuses the pre-existing `0006_journal.sql` base schema from Phase 0,
extended with tags/photos/voice notes rather than replaced.

- [x] `domain` — `JournalEntry` (title/content/mood/entryDate/tagIds),
  `MoodLevel` (5-point great→awful scale), `JournalTag`, `JournalPhoto`,
  `JournalVoiceNote`; pure rules (search/tag/mood filtering, month
  grouping, mood trend/distribution/average, a journaling streak, and
  `isEntryEmpty` for discarding blank drafts).
- [x] `infrastructure` — `LocalJournalRepository` seeded with ~3 months of
  realistic entries including a 5-day streak; `SupabaseJournalRepository`
  (not wired in).
- [x] `application` — Zustand store (`journal-store.ts`).
- [x] `presentation` — two tabs: Timeline (month-grouped feed with a
  search/tag/mood filter bar, mirroring Finance's
  `TransactionFiltersBar`), Mood (streak/average/total-entries stat cards,
  a mood trend line chart, a mood distribution donut). Clicking an entry —
  or "New entry", which creates a draft and opens it immediately — opens
  `EntryDetailSheet`, reusing the Tasks/Travel `Sheet` detail pattern.
- [x] New schema (`0012_journal_extended.sql`): `journal_tags`,
  `journal_entry_tags`, `journal_entry_photos`,
  `journal_entry_voice_notes` tables, all with RLS.
- [x] First module to use `MediaRecorder`/`getUserMedia` for real
  in-browser audio recording (`VoiceNoteRecorder`), with mic
  permission/device failures caught and shown inline.

## Phase 10 — Analytics ✅

Built out of order (before Habits/Goals) for the same reason every
module since Tasks jumped the queue — it was requested next, and unlike
every phase above, it depends on the other modules existing first: there
would be nothing to chart otherwise. Not a `domain/application/
infrastructure/presentation` module in the usual sense — it owns no
data, no migration, and no Supabase adapter. See "Cross-module reads
(Analytics)" in `docs/ARCHITECTURE.md` and `src/modules/analytics/
README.md` for the deliberate, scoped exception that lets it read real
data from five sibling modules' `domain`/`infrastructure` layers (never
their `application` stores or `presentation` components).

- [x] `domain/rules.ts` — the one genuinely new aggregation logic
  (Tasks status/priority breakdown, weekly completion trend,
  productivity stats); every other tab calls its source module's own
  pure `domain/rules.ts` functions directly instead of re-deriving them.
- [x] `infrastructure/read-sources.ts` — constructs
  `LocalTaskRepository`/`LocalFinanceRepository`/`LocalMealsRepository`/
  `LocalTravelRepository`/`LocalJournalRepository` and reads a
  point-in-time snapshot, independent of whether those modules' own
  stores have ever been hydrated this session.
- [x] `application` — Zustand store (`analytics-store.ts`) with only a
  `hydrate()`, no create/update/delete — Analytics never mutates another
  module's data.
- [x] `presentation` — seven tabs (Productivity, Finance, Habits, Goals,
  Meals, Mood, Travel), each a handful of `StatCard`s plus 1–3 charts
  built on two new shared primitives, `TrendChart` (bar/line, optional
  goal `ReferenceLine`) and `DonutChart` (categorical share-of-total) —
  covering every chart shape all seven tabs need. Habits and Goals show
  an honest `EmptyState` (those modules have no real data yet) rather
  than fabricated numbers.
- [x] No new schema — nothing here to persist.

## Phase 11 — AI Assistant ✅

Built out of order for the same reason every module since Tasks jumped
the queue — it was requested next. Like Analytics, not a plain 4-layer
data module: it owns no data and, unlike every prior module, is the
first to talk to an external API and the first to need a server-side
Route Handler. See "Cross-module reads (Analytics & Assistant)" and
"AI Assistant (Claude API + MCP-shaped tools)" in `docs/ARCHITECTURE.md`,
and `src/modules/assistant/README.md`, for the full shape.

- [x] `domain/tools.ts` — a six-tool registry in MCP-compatible shape
  (`{ name, description, inputSchema }`, JSON Schema input) covering
  tasks-today, this-month finance, goals status (honest "not built"),
  journal mood, meals-today, and upcoming travel.
- [x] `domain/rules.ts` — per-tool summarizers reusing sibling modules'
  own `domain/rules.ts` functions (same pattern Analytics established),
  a bilingual (en/vi) keyword intent matcher, and `localAnswer()`, a
  deterministic template-based answer engine that needs no API key.
- [x] `infrastructure/read-sources.ts` — cross-module snapshot read,
  mirrors `analytics/infrastructure/read-sources.ts`.
  `infrastructure/tool-executor.ts` — executes one named tool against
  that snapshot. `infrastructure/anthropic-tools.ts` — converts the
  registry to the Anthropic SDK's tool shape (server-only).
- [x] `src/app/api/assistant/route.ts` — the app's first Route Handler.
  `GET` reports whether `ANTHROPIC_API_KEY` is configured; `POST` proxies
  one `claude-opus-4-8` `messages.create` call with the tool registry
  attached. Deliberately thin — see "AI Assistant" in
  `docs/ARCHITECTURE.md` for why tool *execution* can't live here.
- [x] `application/assistant-store.ts` — chat history, hydrate(), and
  `sendMessage()`, which runs the real multi-turn tool-use loop
  client-side (capped at 4 iterations) when an API key is available,
  falling back to `localAnswer()` with no key or on any failure — the
  Assistant always answers something.
- [x] `presentation/assistant-view.tsx` — a chat UI (message bubbles,
  tool-citation chips, suggested prompts for the brief's three example
  questions plus a mood question, a badge showing whether the last
  answer came from Claude or the local engine).
- [x] Nav entry, `assistant.json` i18n namespace (en/vi, including
  templated local-engine answer strings), route wiring.
- [x] No new schema — nothing here to persist. `ANTHROPIC_API_KEY` added
  to `.env.example` (server-only, optional).
- [ ] Swap the client/server split tool-use loop for a normal
  server-side loop once Supabase reads replace `localStorage` (Phase 1) —
  tracked in `docs/ARCHITECTURE.md`.
- [ ] Stand up a live MCP server transport (`@modelcontextprotocol/sdk`)
  exposing `domain/tools.ts` to external MCP clients, once one exists to
  connect — the registry's shape already supports this without a
  contract change.

## Ongoing / cross-cutting (pick up as needed, not a phase)

- Automated tests: unit tests for each module's `domain` layer as it's
  built, integration tests for `application` use-cases against a local
  Supabase instance.
- Accessibility pass once there are real interactive flows to audit, not
  just placeholders.
- Regenerate `database.types.ts` from the live schema once a Supabase
  project is provisioned (see `supabase/README.md`), replacing the
  hand-written version.
