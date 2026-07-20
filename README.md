# LifeOS

A personal life management system — tasks, habits, finance, journal, and
goals in one place. This repository currently contains the **foundation**:
architecture, folder structure, design system, navigation shell, i18n, and
database schema. No feature modules are implemented yet.

See `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, and `docs/ROADMAP.md`
for the full picture.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Framer Motion · Supabase (Postgres) · next-intl

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase project URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to
`/vi` (default locale; `/en` also available).

## Database

SQL migrations live in `supabase/migrations/`. See `supabase/README.md` for
how to apply them and regenerate TypeScript types.

## Project structure

```
src/
  app/[locale]/        Next.js routes — thin wiring only
  modules/              One folder per life domain, each with its own
                         domain/application/infrastructure/presentation
  shared/                Cross-cutting: UI kit, i18n, config, Supabase clients
supabase/migrations/     Versioned SQL schema
docs/                    Architecture, design system, and roadmap docs
```

Full rationale in `docs/ARCHITECTURE.md`.
