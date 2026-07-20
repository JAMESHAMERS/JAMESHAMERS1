# tasks module

The first real vertical module built on the `_template` pattern (see
`src/modules/_template/README.md`), all four layers present.

- `domain/types.ts` — `Task`, `Subtask`, `Label`, `Comment`, `Attachment`.
- `domain/rules.ts` — pure functions (overdue checks, grouping, filtering,
  progress calculation). No framework imports; unit-testable as-is.
- `domain/repository.ts` — `TaskRepository` port. Everything in
  `application`/`presentation` depends on this interface, never on a
  concrete storage implementation.
- `infrastructure/local-task-repository.ts` — **active today.** Browser
  `localStorage`-backed implementation. There is no auth yet (see
  `docs/ROADMAP.md` Phase 1), so a real Supabase-backed repository can't
  authenticate a user — this is what makes the module fully interactive
  right now without one.
- `infrastructure/supabase-task-repository.ts` — production adapter against
  `supabase/migrations/0003_tasks.sql` + `0008_tasks_extended.sql`. Written
  and ready, but not wired in — switching to it once auth lands is a
  one-line change in `application/task-store.ts`, not a rewrite.
- `application/task-store.ts` — a Zustand store that owns a `TaskRepository`
  instance and exposes reactive state + actions to `presentation`. This is
  the pragmatic shape "application layer" takes in a client-heavy,
  drag-and-drop-driven module: the use-cases *are* the store actions
  (`createTask`, `moveTask`, `addSubtask`, ...), each a thin call into the
  repository followed by a state update.
- `presentation/` — `TasksView` (composition root: filters, view switcher),
  three views (`KanbanView` with `@dnd-kit` drag-and-drop, `ListView`,
  `CalendarView`), and the shared `TaskDetailSheet` / `CreateTaskDialog`
  editors used by all three.

Attachments are metadata-only locally (an object URL, not a real upload) —
`SupabaseTaskRepository.addAttachment` is where real file upload to
Supabase Storage belongs once that's wired up.
