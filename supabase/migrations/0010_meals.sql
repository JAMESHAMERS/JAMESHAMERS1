-- Meals module: meal entries (breakfast/lunch/dinner/snack, calories +
-- macros), water intake entries, and one nutrition-goals row per user. Same
-- RLS-from-first-migration convention as every other table in this schema.

create table public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  calories integer not null check (calories >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meal_entries enable row level security;

create policy "Users manage their own meal entries"
  on public.meal_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index meal_entries_user_logged_idx on public.meal_entries (user_id, logged_at);

create table public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.water_entries enable row level security;

create policy "Users manage their own water entries"
  on public.water_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index water_entries_user_logged_idx on public.water_entries (user_id, logged_at);

-- One row per user — daily calorie/macro/water targets. Modeled as a
-- settings-like table (primary key = user_id) rather than a generic
-- key-value store, since there's exactly one fixed set of fields.
create table public.nutrition_goals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  calories integer not null default 2000 check (calories >= 0),
  protein_g numeric not null default 120 check (protein_g >= 0),
  carbs_g numeric not null default 250 check (carbs_g >= 0),
  fat_g numeric not null default 65 check (fat_g >= 0),
  water_ml integer not null default 2000 check (water_ml >= 0),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_goals enable row level security;

create policy "Users manage their own nutrition goals"
  on public.nutrition_goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
