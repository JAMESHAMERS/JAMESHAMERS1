-- Travel module: trips, per-trip itinerary items, expenses, photos, and
-- notes. Same RLS-from-first-migration convention as every other table in
-- this schema. Child tables cascade-delete with their trip.

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  cover_color text not null default '#6366f1',
  budget numeric not null default 0 check (budget >= 0),
  currency text not null default 'VND',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

alter table public.trips enable row level security;

create policy "Users manage their own trips"
  on public.trips
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.trip_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('flight', 'hotel', 'activity', 'food', 'transport', 'other')),
  title text not null,
  location text not null default '',
  lat numeric,
  lng numeric,
  start_at timestamptz not null,
  end_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_itinerary_items enable row level security;

create policy "Users manage their own itinerary items"
  on public.trip_itinerary_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index trip_itinerary_items_trip_idx on public.trip_itinerary_items (trip_id, start_at);

create table public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (category in ('transport', 'accommodation', 'food', 'activities', 'shopping', 'other')),
  amount numeric not null check (amount >= 0),
  currency text not null default 'VND',
  note text not null default '',
  spent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_expenses enable row level security;

create policy "Users manage their own trip expenses"
  on public.trip_expenses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index trip_expenses_trip_idx on public.trip_expenses (trip_id, spent_at);

create table public.trip_photos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  lat numeric,
  lng numeric,
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.trip_photos enable row level security;

create policy "Users manage their own trip photos"
  on public.trip_photos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index trip_photos_trip_idx on public.trip_photos (trip_id, taken_at);

create table public.trip_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trip_notes enable row level security;

create policy "Users manage their own trip notes"
  on public.trip_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index trip_notes_trip_idx on public.trip_notes (trip_id, created_at);
