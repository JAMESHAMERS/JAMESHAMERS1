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

## Phase 5 — Finance

- Transactions list, category budgets vs. actuals.
- First real use of the reserved `chart-1..5` design tokens for spend
  visualizations.

## Phase 6 — Journal

- Rich-text or markdown entry editor, mood tracking, entry search.

## Ongoing / cross-cutting (pick up as needed, not a phase)

- Automated tests: unit tests for each module's `domain` layer as it's
  built, integration tests for `application` use-cases against a local
  Supabase instance.
- Accessibility pass once there are real interactive flows to audit, not
  just placeholders.
- Regenerate `database.types.ts` from the live schema once a Supabase
  project is provisioned (see `supabase/README.md`), replacing the
  hand-written version.
