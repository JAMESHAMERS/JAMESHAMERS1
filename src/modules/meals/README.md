# meals module

Third full 4-layer module, built the same way as `modules/finance`
(see that module's README, and `modules/tasks`'s for the original
write-up) — same `domain/repository.ts` port + two implementations, same
Zustand-as-application-layer shape, same "runs on local storage until auth
exists" reasoning.

- `domain/types.ts` — `MealEntry` (breakfast/lunch/dinner/snack, calories +
  protein/carbs/fat in grams), `WaterEntry` (ml), `NutritionGoals`
  (calorie/macro/water daily targets, with `DEFAULT_GOALS` for
  seed/fallback).
- `domain/rules.ts` — pure functions: day-key math (`toDayKey`/`dayKeyOf`/
  `lastDays`, reimplemented locally rather than importing
  `shared/lib/date-grid.ts`, same call as Finance's month-key math),
  day/weekly summaries and averages, macro-to-calorie conversion
  (protein/carbs = 4 kcal/g, fat = 9 kcal/g), goal progress. No framework
  imports.
- `domain/repository.ts` — `MealsRepository` port.
- `infrastructure/local-meals-repository.ts` — **active today.**
  `localStorage`-backed, seeded with ~1 week of realistic meals and water
  intake (see `seed-data.ts`) so the Today/Weekly tabs have something to
  show on first visit.
- `infrastructure/supabase-meals-repository.ts` — production adapter
  against `supabase/migrations/0010_meals.sql`. Written and ready, not
  wired in — see `docs/ROADMAP.md` Phase 1.
- `application/meals-store.ts` — Zustand store; actions are thin calls into
  the injected `MealsRepository` followed by a state patch.
- `presentation/` — `MealsView` (tab switcher: Today, Weekly) plus one file
  per tab in `tabs/`, and shared editors/widgets (`MealDialog`,
  `CalorieRing`, `MacroProgress`, `WaterTracker`) in `components/`.

Two tabs, not four like Finance — "Today" folds meal-entry CRUD *and* the
daily summary into one view via a day navigator (mirrors Finance's
month-nav, generalizes "today" to "any day"); "Weekly" is pure statistics
(trailing 7 days, always ending today — no navigation, since a rolling
week view answers "how's this week going" without inventing a date-range
picker nobody asked for).

Nutrition scope is calories + the 3 standard macros (protein/carbs/fat) —
no fiber/sugar/sodium tracking, matching typical single-user diet-tracking
apps rather than a full food-database integration.
