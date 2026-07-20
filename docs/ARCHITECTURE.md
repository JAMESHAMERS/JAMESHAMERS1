# Architecture

This document explains how LifeOS's foundation is put together and why.
See `docs/DESIGN_SYSTEM.md` for visual tokens and `docs/ROADMAP.md` for
what comes after this foundation phase.

## Principles

1. **Feature-sliced Clean Architecture.** LifeOS is not one application
   with one domain — it's a shell hosting many independent life domains
   (tasks, habits, finance, journal, goals, ...). Each domain gets its own
   module with its own four layers, rather than every domain sharing one
   global `domain/application/infrastructure/presentation` split. A global
   split works for a single bounded context; it doesn't scale to many
   unrelated ones without becoming a shared dumping ground.
2. **Routing is wiring, not logic.** `src/app/**/page.tsx` files should be
   short — they translate a URL into a call to a module's `presentation`
   layer. Business logic never lives in a route file.
3. **Dependencies point inward.** `presentation → application → domain`.
   `infrastructure` implements ports that `domain`/`application` define; it
   is never imported *by* them. This is what lets `infrastructure` (e.g. the
   Supabase adapter) be replaced without touching business logic.
4. **Shared vs. module-owned.** If more than one module would need to
   import something from a sibling module, it belongs in `src/shared`
   instead. Modules should never import from each other directly.

## Folder structure

```
src/
  app/                              # Next.js App Router — routing only
    [locale]/
      layout.tsx                    # root <html>/<body>, theme + intl providers
      not-found.tsx                 # localized 404
      (marketing)/                  # public routes
        layout.tsx
        page.tsx                    # landing page
      (dashboard)/                  # authenticated app shell
        layout.tsx                  # renders modules/dashboard's DashboardShell
        dashboard/page.tsx          # overview
        tasks/page.tsx
        habits/page.tsx
        finance/page.tsx
        journal/page.tsx
        goals/page.tsx
        settings/page.tsx
    not-found.tsx                   # fallback for paths outside [locale]
    globals.css                     # design tokens (see DESIGN_SYSTEM.md)
  proxy.ts                          # next-intl locale routing (Next 16's
                                     # renamed `middleware.ts`)
  modules/
    dashboard/                      # app shell — nav, layout (no domain logic)
    settings/                       # appearance/language preferences
    overview/                       # /dashboard widgets — view-model + mock aggregation
    tasks/                          # full 4-layer module — see "Client state" below
      domain/                       # types.ts, rules.ts, repository.ts (port)
      infrastructure/                # LocalTaskRepository (active), SupabaseTaskRepository
      application/                  # task-store.ts (Zustand)
      presentation/                 # views/ (kanban, list, calendar), components/
    finance/                        # full 4-layer module, same pattern as tasks/
      domain/                       # types.ts, rules.ts, repository.ts (port)
      infrastructure/                # LocalFinanceRepository (active), SupabaseFinanceRepository
      application/                  # finance-store.ts (Zustand)
      presentation/                 # tabs/ (overview, transactions, budgets, reports), components/
    meals/                          # full 4-layer module, same pattern as tasks/ and finance/
      domain/                       # types.ts, rules.ts, repository.ts (port)
      infrastructure/                # LocalMealsRepository (active), SupabaseMealsRepository
      application/                  # meals-store.ts (Zustand)
      presentation/                 # tabs/ (today, weekly), components/
    travel/                         # full 4-layer module, same pattern as tasks/ and finance/
      domain/                       # types.ts, rules.ts, repository.ts (port)
      infrastructure/                # LocalTravelRepository (active), SupabaseTravelRepository
      application/                  # travel-store.ts (Zustand)
      presentation/                 # tabs/ (trips, statistics), detail-tabs/ (itinerary,
                                     # expenses, photos, map, notes, timeline — inside the
                                     # per-trip Sheet), components/
    _template/                      # copy this to start a new module
      domain/
      application/
      infrastructure/
      presentation/
  shared/
    components/
      ui/                           # shadcn/ui primitives (Radix-based)
      composed/                     # PageHeader, EmptyState, StatCard, DatePicker, ThemeToggle...
      providers/                    # ThemeProvider
    config/                         # site.ts, nav.ts — declarative registries
    i18n/                           # next-intl routing/navigation/request config + messages
    lib/
      utils.ts                      # cn()
      date-grid.ts                  # month-grid math shared by every calendar UI
      format.ts                     # currency/bytes/relative-time formatting
      supabase/                     # client.ts (browser), server.ts (server)
    types/                          # database.types.ts, shared domain-agnostic types
supabase/
  migrations/                       # numbered SQL migrations
docs/
  ARCHITECTURE.md                   # this file
  DESIGN_SYSTEM.md
  ROADMAP.md
```

## Why a module template instead of scaffolding tooling

A `_template` folder with READMEs per layer was chosen over a codegen
script (`npm run new-module`) because at this stage there's exactly one
real module pattern to follow and no team process yet that a generator
would need to enforce. Revisit this once 3+ modules exist and the copy-paste
starts drifting.

## Client state & drag-and-drop (Tasks module)

`modules/tasks` is the first module with all four layers filled in for
real, and the first to need genuinely interactive client state (Kanban
drag-and-drop, a task detail editor). Two decisions worth calling out
since they shape how any future module with similar needs should look:

- **Zustand as the "application" layer.** For a client-heavy module, the
  use-cases *are* the store's actions — each one (`createTask`, `moveTask`,
  `addSubtask`, ...) is a thin call into the injected `TaskRepository`
  followed by a state patch mirroring what was just persisted. Server
  Components / Server Actions remain the right shape for modules that are
  mostly read-and-render; Zustand is only pulled in where a module needs
  shared, cross-component client state that outlives a single component
  tree (here: the board, the filters, and the detail sheet all reading/
  writing the same task list).
- **`@dnd-kit` for drag-and-drop**, with a "drop to commit" model rather
  than live re-parenting during drag-over: `onDragEnd` computes the target
  column/index once and calls `moveTask`/`reorderTasks`, with a
  `DragOverlay` for visual feedback while dragging. Simpler and less
  bug-prone than live-shuffling multiple `SortableContext` arrays on every
  `dragOver` event, at the cost of the list not visually reordering until
  drop — an accepted trade-off here, not a limitation to design around
  elsewhere by default.

`modules/tasks` currently runs on `LocalTaskRepository`
(`localStorage`-backed) instead of `SupabaseTaskRepository` because there's
no `auth.uid()` yet for Row Level Security to scope rows to (see
`docs/ROADMAP.md` Phase 1). Both implement the same `TaskRepository` port
from `domain/repository.ts`, so switching is a one-line change in
`application/task-store.ts`, not a rewrite — see
`src/modules/tasks/README.md`.

`modules/finance` (built the same way — see its own README) repeats this
exactly: `FinanceRepository` port, `LocalFinanceRepository` active,
`SupabaseFinanceRepository` waiting on auth, Zustand as the application
layer. Its dialogs (`TransactionDialog`, `BudgetDialog`) also reuse the
Tasks module's "adjust state during render, not in an effect" pattern for
resetting a form when *what's being edited* changes — see
`task-detail-sheet.tsx` for the original write-up of why.

`modules/meals` repeats the same shape a third time (`MealsRepository`
port, `LocalMealsRepository` active, `SupabaseMealsRepository` waiting on
auth, Zustand as the application layer, `MealDialog` using the same
render-time form-reset pattern) — see its own README. It has two tabs
instead of Finance's four: "Today" folds CRUD *and* the daily summary into
one view via a day navigator (mirrors Finance's month-nav), "Weekly" is
pure statistics over a fixed trailing 7 days ending today (no date-range
picker). Its `domain/rules.ts` also reimplements day-key math locally
rather than importing `shared/lib/date-grid.ts`, the same call Finance
made for month-key math — each module's date arithmetic is small enough
that a shared abstraction would cost more than it saves.

`modules/travel` repeats the same shape a fourth time (`TravelRepository`
port, `LocalTravelRepository` active with cascading delete,
`SupabaseTravelRepository` waiting on auth) but is the first module to
combine two different "detail" UI patterns at once: a Finance-style
top-level `Tabs` switcher (Trips / Statistics) *and* a Tasks-style
`Sheet`-based detail view (`TripDetailSheet`) for a single trip — except
that Sheet itself has a second, nested `Tabs` for its six sub-features
(Itinerary, Expenses, Photos, Map, Notes, Timeline), since that's too much
content for one long scrolling column like `task-detail-sheet.tsx`. A
trip's `TripStatus` (upcoming/ongoing/completed) is deliberately *derived*
in `domain/rules.ts#tripStatus` by comparing today's date against the
trip's date range, not stored as a column — a stored status would drift
out of sync the moment a trip's dates pass without anyone opening the app.
Its Map tab (`TripMap`) is a custom SVG pin visualization projected into
the bounding box of the trip's own coordinates rather than an embedded
tile provider, since there's no map API key/network dependency to lean on
— see `modules/travel/README.md` for why, and for the same
`URL.createObjectURL` trade-off Tasks' attachments already made, reused
here for trip photos.

## Charts (recharts)

Two non-obvious things learned building the Finance module's charts,
worth knowing before adding more:

- **Pie/donut entrance animation can look like a rendering bug.**
  recharts animates a `Pie` growing from 0° by default; a screenshot taken
  ~1–1.5s after mount can catch it mid-sweep, which looks exactly like a
  cropped/mis-sized chart. It isn't — it finishes on its own. Don't chase
  this as a sizing bug; if a screenshot/test needs a settled chart, wait
  out the animation (or set `isAnimationActive={false}` on that specific
  `Pie`) rather than fighting the container.
- **Prefer percentage radii over fixed pixel radii on `Pie`**
  (`innerRadius="55%"` not `innerRadius={55}`), and give `ChartContainer`
  explicit `h-[…] w-full` rather than `aspect-square` when the chart sits
  in a CSS Grid column — matches what already works for
  `RadialBarChart`/`BarChart` elsewhere in the app, and degrades gracefully
  if a container is ever measured smaller than expected on first paint.
- `shared/components/ui/chart.tsx`'s `ChartLegendContent` wraps
  (`flex-wrap`) and `ChartContainer`'s `ResponsiveContainer` debounces
  resize handling (`debounce={50}`) — both fixed for every chart in the
  app, not just Finance's, after a legend with many entries (8 categories)
  overflowed into a sibling card at the default no-wrap.

## Routing & i18n

- Locale is a required first path segment (`/vi/...`, `/en/...`,
  `localePrefix: "always"`), resolved by `src/proxy.ts` using next-intl.
  Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`; the
  next-intl middleware factory is unaffected and is simply re-exported
  under the new file name.
- `src/shared/i18n/routing.ts` is the single source of truth for supported
  locales (`vi`, `en`) and the default (`vi`). `navigation.ts` re-exports
  `Link`/`useRouter`/`usePathname`/`redirect` wrapped to stay locale-aware —
  modules should import navigation from there, not `next/navigation`.
- Messages are split into small per-namespace JSON files
  (`common`, `nav`, `theme`, `settings`, `modules`, plus one per feature
  module: `tasks`, `finance`, `meals`, ...) under
  `src/shared/i18n/messages/{en,vi}/` instead of one large file, so a new
  module adds one file rather than growing a monolith. `request.ts` merges
  them per request.
- Route groups `(marketing)` and `(dashboard)` split public pages from the
  authenticated shell without affecting the URL (no `/marketing/` or
  `/dashboard-group/` segment appears).

## Theming

- `next-themes` (`class` strategy) toggles a `dark` class on `<html>`.
  Tailwind v4's `dark:` variant is repointed from
  `prefers-color-scheme` to that class via
  `@custom-variant dark (&:is(.dark *));` in `globals.css`.
- Every color is a semantic CSS variable (`--background`, `--primary`, ...)
  defined once for light (`:root`) and once for dark (`.dark`), then
  exposed to Tailwind via `@theme inline`. Components reference
  `bg-background`, `text-muted-foreground`, etc. — never a raw palette
  value — so a full re-theme is a two-block CSS edit.
- `profiles.theme` / `profiles.locale` columns exist in the schema for
  syncing preferences server-side once auth exists, but nothing writes to
  them yet — `src/modules/settings` is currently client-state only.

## Data layer

- `src/shared/lib/supabase/client.ts` — browser client (Client Components).
- `src/shared/lib/supabase/server.ts` — server client (Server Components,
  Server Actions, Route Handlers), created per-request from `next/headers`
  cookies, not module-level cached.
- `src/shared/types/database.types.ts` is hand-written to mirror
  `supabase/migrations/` until a real Supabase project exists to generate
  it from (see `supabase/README.md`).
- Every table has Row Level Security enabled from its first migration —
  there is no "add RLS later" step in this codebase's history.

## What this foundation deliberately does not include

No auth flow, no tests, and — outside of `modules/tasks`, `modules/finance`,
`modules/meals`, and `modules/travel` — no module has real CRUD yet
(`habits`/`journal`/`goals` are still route placeholders). All four real
modules run on local-only persistence rather than Supabase for the reason
explained above. See `docs/ROADMAP.md` for what's next.
