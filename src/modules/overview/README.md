# overview module

The dashboard landing page (`/dashboard`). Unlike a normal module, its
`domain` is a set of read-only view-model types (`OverviewData`) rather than
real business entities, because it aggregates Tasks/Habits/Finance/Goals —
none of which exist as real modules yet.

- `domain/types.ts` — shapes the widgets render.
- `infrastructure/mock-data.ts` — stands in for a real aggregation
  use-case. Returns static/deterministic data, not persisted anywhere.
- `presentation/` — one component per widget (`WelcomeCard`,
  `TodayTasksCard`, `CalendarCard`, `FinanceSummaryCard`,
  `GoalProgressCard`, `RecentActivityCard`, `QuickActionsCard`,
  `ProductivityScoreCard`), composed in `overview-view.tsx`.

**When Tasks/Finance/Goals become real modules:** replace
`infrastructure/mock-data.ts` with an application-layer function that reads
from each module's real repository and maps the result into `OverviewData`.
No `presentation` component needs to change — they only know about
`OverviewData`, never about mock data or any other module's internals.

Today's Tasks' checkbox toggling is local component state only — nothing
is persisted. That's intentional until a real `TaskRepository` exists.
