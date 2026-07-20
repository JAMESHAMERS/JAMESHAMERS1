# analytics module

A different kind of module from `tasks`/`finance`/`meals`/`travel`/
`journal`: it owns no data of its own. There is no
`0013_analytics.sql` migration — there's nothing here to persist, only
existing modules' data to chart. It still follows the same
`domain/application/infrastructure/presentation` shape, but each layer
means something slightly different:

- `domain/types.ts` — just the `AnalyticsTab` enum.
- `domain/rules.ts` — the one genuinely new piece of aggregation logic
  Analytics needs: task status/priority breakdowns and a weekly
  completion trend, since Tasks' own `domain/rules.ts` never needed
  those. Everywhere else (Finance, Meals, Travel, Journal), Analytics
  calls each sibling module's own pure `domain/rules.ts` functions
  directly from its tab components — `monthlyBreakdown`/
  `categoryBreakdown` from Finance, `dailySummaries`/`averageOf` from
  Meals, `computeTravelStats`/`monthlySpendTrend` from Travel,
  `moodTrend`/`moodDistribution`/`journalingStreak` from Journal —
  instead of re-deriving the same math a second time.
- `infrastructure/read-sources.ts` — constructs each sibling module's own
  `Local<X>Repository` (the same `localStorage`-backed classes those
  modules' Zustand stores use) and reads a point-in-time snapshot. Doing
  it this way, instead of depending on those modules' own stores, means
  Analytics shows real data even if the user has never opened
  /tasks, /finance, etc. this session.
- `application/analytics-store.ts` — the one Zustand store in this
  codebase with no create/update/delete actions, only `hydrate()`.
  Analytics never mutates another module's data.
- `presentation/` — one tab per requested dashboard (Productivity,
  Finance, Habits, Goals, Meals, Mood, Travel), each a handful of
  `StatCard`s plus 1–3 charts built on two shared primitives,
  `TrendChart` (bar or line, optional goal `ReferenceLine`) and
  `DonutChart` (categorical share-of-total) — covering every chart shape
  the seven tabs need without five near-identical copies of the same
  `recharts` setup.

## Why this module is allowed to import its siblings

`docs/ARCHITECTURE.md` states a real rule: "Modules should never import
from each other directly." Analytics is a deliberate, narrow, documented
exception to it — not a loophole. The boundary that still holds:

- **In bounds:** a sibling module's `domain` (types + pure rule
  functions — no side effects, nothing to break) and `infrastructure`'s
  `Local<X>Repository` classes, used strictly read-only.
- **Out of bounds:** a sibling module's `application` (its Zustand store)
  or `presentation` (its components) — Analytics never renders another
  module's UI or reaches into its live client state, and it rebuilds its
  own small `*-meta.ts` (`analytics-meta.ts`) for status/priority/mood/
  category colors rather than importing each module's own, even though
  that means a few color constants exist in two places. That's the same
  trade-off every module's category colors already accept over a shared
  lookup table — see `docs/ARCHITECTURE.md`'s "shared vs. module-owned"
  principle.

This keeps the rule meaningful for every *feature* module (Tasks still
can't reach into Finance's business logic) while letting a genuinely
cross-cutting *reporting* module do the one thing it exists to do: show
real numbers from real data. If a second module ever needed this same
kind of read access, that would be the signal to extract a proper shared
read layer instead of repeating the exception.

## Why Habits and Goals show an empty state

Both modules are still route placeholders (see `docs/ROADMAP.md`) with no
real repository to read from. Rather than fabricate plausible-looking
numbers for two of the seven requested dashboards, their tabs render the
same `EmptyState` component every other unbuilt module uses, explaining
what's missing — honest is better than decorative here.
