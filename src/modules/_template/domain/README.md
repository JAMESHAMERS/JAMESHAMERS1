# domain

Pure business rules for this module. No Next.js, no React, no Supabase — a
file in here should be importable in a plain Node script or a test with zero
mocking.

Typical contents:

- **Entities / value objects** — plain TS types or small classes
  (`Task`, `HabitStreak`, `Money`).
- **Domain logic** — pure functions operating on those types
  (`isOverdue(task, now)`, `calculateStreak(logs)`).
- **Ports** — interfaces that `application` depends on and `infrastructure`
  implements (`TaskRepository`), if this module needs one.

If you find yourself importing `next/*`, `react`, or `@supabase/*` in this
folder, it belongs in `infrastructure` or `presentation` instead.
