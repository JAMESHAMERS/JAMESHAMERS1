-- Extends the Journal module schema from 0006_journal.sql with tags,
-- photos, and voice notes. Split from 0006 rather than editing it, since
-- that migration may already be applied to a running database (same
-- convention as 0008_tasks_extended.sql / 0009_finance_extended.sql).

-- User-defined tags, normalized rather than a free-text array column so
-- the same tag renders identically (name + color) everywhere and can be
-- renamed in one place — same reasoning as Finance's `categories` and
-- Tasks' `labels`.
create table public.journal_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.journal_tags enable row level security;

create policy "Users manage their own journal tags"
  on public.journal_tags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.journal_entry_tags (
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  tag_id uuid not null references public.journal_tags (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (entry_id, tag_id)
);

alter table public.journal_entry_tags enable row level security;

create policy "Users manage their own journal entry tags"
  on public.journal_entry_tags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.journal_entry_photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

alter table public.journal_entry_photos enable row level security;

create policy "Users manage their own journal entry photos"
  on public.journal_entry_photos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index journal_entry_photos_entry_idx on public.journal_entry_photos (entry_id);

create table public.journal_entry_voice_notes (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

alter table public.journal_entry_voice_notes enable row level security;

create policy "Users manage their own journal voice notes"
  on public.journal_entry_voice_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index journal_entry_voice_notes_entry_idx on public.journal_entry_voice_notes (entry_id);
