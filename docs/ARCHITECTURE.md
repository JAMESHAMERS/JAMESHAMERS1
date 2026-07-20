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
    _template/                      # copy this to start a new module
      domain/
      application/
      infrastructure/
      presentation/
  shared/
    components/
      ui/                           # shadcn/ui primitives (Radix-based)
      composed/                     # PageHeader, EmptyState, StatCard, ThemeToggle...
      providers/                    # ThemeProvider
    config/                         # site.ts, nav.ts — declarative registries
    i18n/                           # next-intl routing/navigation/request config + messages
    lib/
      utils.ts                      # cn()
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
  (`common`, `nav`, `theme`, `settings`, `modules`) under
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

No auth flow, no CRUD for any module, no real data fetching, no tests.
Those are feature work layered on top of this shell — see
`docs/ROADMAP.md`.
