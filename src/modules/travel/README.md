# travel module

Fourth full 4-layer module, built the same way as `modules/finance` and
`modules/meals` (see their READMEs) — same `domain/repository.ts` port +
two implementations, same Zustand-as-application-layer shape, same "runs
on local storage until auth exists" reasoning.

- `domain/types.ts` — `Trip` (name/destination/date range/budget/cover
  color), `ItineraryItem` (flight/hotel/activity/food/transport/other,
  optional lat/lng), `TripExpense` (transport/accommodation/food/
  activities/shopping/other), `TripPhoto` (url/caption/optional lat/lng),
  `TripNote`. `TripStatus` (upcoming/ongoing/completed) is **derived**, not
  stored — `domain/rules.ts#tripStatus` compares today's date against the
  trip's date range, so it can never go stale the way a persisted status
  field could.
- `domain/rules.ts` — pure functions: status/duration, per-trip filtering
  (`itineraryForTrip`, `expensesForTrip`, ...), budget progress, category
  breakdowns, day-grouping for the Itinerary tab, a merged
  itinerary+expense+photo+note feed for the Timeline tab
  (`buildTimeline`), and global stats/spend-trend for the Statistics tab.
  No framework imports.
- `domain/repository.ts` — `TravelRepository` port.
- `infrastructure/local-travel-repository.ts` — **active today.**
  `localStorage`-backed, seeded with 3 trips (one completed, one ongoing,
  one upcoming — see `seed-data.ts`) so every status badge and the
  Statistics tab have something to show on first visit. `deleteTrip`
  cascades to that trip's itinerary items, expenses, photos, and notes,
  same as the DB migration's `on delete cascade`.
- `infrastructure/supabase-travel-repository.ts` — production adapter
  against `supabase/migrations/0011_travel.sql`. Written and ready, not
  wired in — see `docs/ROADMAP.md` Phase 1.
- `application/travel-store.ts` — Zustand store; actions are thin calls
  into the injected `TravelRepository` followed by a state patch. Also
  holds UI-only state (`selectedTripId`, `detailTab`) for which trip's
  detail sheet is open and which of its 6 sub-tabs is active.
- `presentation/` — `TravelView` (top tabs: Trips, Statistics). Trips is a
  card grid; clicking a card opens `TripDetailSheet`, a `Sheet` with its
  own internal `Tabs` for Itinerary/Expenses/Photos/Map/Notes/Timeline —
  the same `Sheet`-based "rich detail view" pattern as Tasks'
  `task-detail-sheet.tsx`, just with tabs instead of one long scroll
  because six sub-features is too much for a single column.

## Photos and Map — why no upload backend or tile provider

`PhotoDialog` uses `URL.createObjectURL` on the selected file, the same
trade-off as Tasks' `AttachmentList`: there's no file storage backend yet,
so the preview doesn't survive a reload. Real upload is
`SupabaseTravelRepository.createPhoto`'s job once auth/storage exist.

The Map tab (`TripMap`) is a custom SVG pin visualization projected into
the bounding box of the trip's own itinerary/photo coordinates, not an
embedded tile provider — this app has no map API key or external network
dependency to lean on, the same constraint that keeps every chart in
LifeOS self-contained. It's not meant to replace a real map, just to show
*where* a trip's points are relative to each other at a glance.
