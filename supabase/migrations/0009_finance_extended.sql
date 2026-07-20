-- Extends the Finance module schema from 0007_finance.sql with categories
-- and the Saving/Investment transaction types. Split from 0007 rather than
-- editing it, since that migration may already be applied to a running
-- database (same convention as 0008_tasks_extended.sql).

-- User-defined categories, scoped to which transaction type they apply to
-- (an "Emergency Fund" category makes sense for savings, not income) —
-- normalized here rather than left as free text on `transactions`/`budgets`
-- so the same category renders identically (name + color) everywhere.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  kind text not null check (kind in ('income', 'expense', 'saving', 'investment')),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.categories enable row level security;

create policy "Users manage their own categories"
  on public.categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Saving/investment weren't in the original type set; replace the check
-- constraint outright (same reasoning as 0008's status/priority widening).
alter table public.transactions drop constraint transactions_type_check;
alter table public.transactions add constraint transactions_type_check
  check (type in ('income', 'expense', 'saving', 'investment'));

alter table public.transactions
  drop column category,
  add column category_id uuid references public.categories (id) on delete set null;

create index transactions_user_category_idx on public.transactions (user_id, category_id);

-- `unique (user_id, category)` in 0007 auto-named itself
-- `budgets_user_id_category_key`; must drop it before dropping the column
-- it references.
alter table public.budgets drop constraint budgets_user_id_category_key;
alter table public.budgets drop column category;
alter table public.budgets
  add column category_id uuid not null references public.categories (id) on delete cascade;
alter table public.budgets add constraint budgets_user_category_unique unique (user_id, category_id);
