# Database

LifeOS uses Supabase (managed Postgres + Auth + Row Level Security).

## Layout

- `migrations/` — numbered, forward-only SQL migrations. Each file is scoped
  to one concern (extensions/helpers, then one file per module's tables) so
  history stays readable as modules are added over time.

## Applying migrations

With the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to a
project:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

For local development against the Supabase emulator:

```bash
supabase start
supabase db reset   # applies every migration in order
```

## Conventions

- Every table has RLS enabled with a single `for all` policy scoping rows to
  `auth.uid() = user_id` (or `= id` for `profiles`). There is no table in
  this schema that isn't private to its owner.
- `id` is always a `uuid` (`gen_random_uuid()`), never a serial integer.
- `created_at` / `updated_at` are `timestamptz`; `updated_at` is maintained
  by the shared `public.set_updated_at()` trigger, not application code.
- Tables where undoing a delete matters (`tasks`, `journal_entries`) use a
  nullable `deleted_at` instead of a hard delete.

## Regenerating TypeScript types

`src/shared/types/database.types.ts` is currently hand-written to match
these migrations. Once a real Supabase project exists, regenerate it from
the live schema instead of hand-editing it:

```bash
supabase gen types typescript --project-id <project-ref> \
  > ../src/shared/types/database.types.ts
```
