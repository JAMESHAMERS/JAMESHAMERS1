-- Journal module schema. Soft-deleted (`deleted_at`) rather than hard
-- deleted, since accidental loss of personal journal entries is a real
-- concern in a way it isn't for, say, a habit log row.

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  content text not null default '',
  mood text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc)
  where deleted_at is null;

create trigger set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

alter table public.journal_entries enable row level security;

create policy "Users manage their own journal entries"
  on public.journal_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
