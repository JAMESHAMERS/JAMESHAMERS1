-- Habits module schema: a habit definition plus a append-only log of daily
-- completions. Kept as two tables (not one with a JSON log column) so
-- streaks/history can be queried and indexed directly.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  target_count integer not null default 1 check (target_count > 0),
  color text,
  icon text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id);

create trigger set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

alter table public.habits enable row level security;

create policy "Users manage their own habits"
  on public.habits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_date date not null,
  count integer not null default 1 check (count > 0),
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, logged_date)
);

create index habit_logs_habit_id_idx on public.habit_logs (habit_id);
create index habit_logs_user_date_idx on public.habit_logs (user_id, logged_date);

alter table public.habit_logs enable row level security;

create policy "Users manage their own habit logs"
  on public.habit_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
