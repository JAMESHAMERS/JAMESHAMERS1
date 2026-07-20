-- Extends the Tasks module schema from 0003_tasks.sql with everything the
-- full Task Management module needs: manual ordering, reminders, labels,
-- subtasks, comments, and attachments. Split from 0003 rather than editing
-- it, since that migration may already be applied to a running database.

alter table public.tasks
  add column position integer not null default 0,
  add column reminder_at timestamptz;

-- The Kanban board has 4 columns (todo / in_progress / in_review / done);
-- 0003_tasks.sql's original status set didn't anticipate an "in review"
-- column, and its priority set didn't anticipate "urgent". Replace both
-- check constraints outright rather than just adding values, since
-- "archived" from the original set has no column in this Kanban model.
alter table public.tasks drop constraint tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('todo', 'in_progress', 'in_review', 'done'));

alter table public.tasks drop constraint tasks_priority_check;
alter table public.tasks add constraint tasks_priority_check
  check (priority in ('low', 'medium', 'high', 'urgent'));

create index tasks_user_status_position_idx
  on public.tasks (user_id, status, position)
  where deleted_at is null;

-- Labels are user-defined and reusable across tasks (many-to-many via
-- task_labels), not free-text on the task row, so the same label renders
-- identically (name + color) everywhere it's attached.
create table public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.labels enable row level security;

create policy "Users manage their own labels"
  on public.labels
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.task_labels (
  task_id uuid not null references public.tasks (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  -- Denormalized from tasks.user_id so RLS here doesn't need a join —
  -- consistent with every other table's "row scoped by its own user_id".
  user_id uuid not null references auth.users (id) on delete cascade,
  primary key (task_id, label_id)
);

create index task_labels_label_id_idx on public.task_labels (label_id);

alter table public.task_labels enable row level security;

create policy "Users manage their own task labels"
  on public.task_labels
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subtasks_task_id_idx on public.subtasks (task_id, position);

create trigger set_updated_at
  before update on public.subtasks
  for each row execute function public.set_updated_at();

alter table public.subtasks enable row level security;

create policy "Users manage their own subtasks"
  on public.subtasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index task_comments_task_id_idx on public.task_comments (task_id, created_at);

alter table public.task_comments enable row level security;

create policy "Users manage their own task comments"
  on public.task_comments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- `storage_path` points at the Supabase Storage object (private bucket,
-- e.g. "task-attachments"); the app resolves it to a signed URL on read
-- rather than storing a public URL directly.
create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index task_attachments_task_id_idx on public.task_attachments (task_id);

alter table public.task_attachments enable row level security;

create policy "Users manage their own task attachments"
  on public.task_attachments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
