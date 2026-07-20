-- Extensions and helper functions shared by every migration that follows.
-- Kept in its own file so it only ever runs once, first.

create extension if not exists "pgcrypto" with schema "extensions";

-- Generic `updated_at` maintenance, reused by every table below instead of
-- repeating the same trigger body per table.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
