-- Database setup. Run this once in the Supabase dashboard: SQL Editor → New
-- query → paste → Run. It is safe to run again; nothing is created twice.

create table if not exists public.tasks (
  id           uuid primary key,
  -- Filled in by the database from the signed-in user, never by the app.
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (length(title) between 1 and 500),
  due_at       timestamptz,
  has_time     boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);

-- Added for recurring tasks and the weekly review. "add column if not
-- exists" keeps this file safe to run again on an existing database.
alter table public.tasks
  -- How the task repeats ({"kind": "weekly", "days": [1]}), or null.
  add column if not exists recurrence jsonb,
  -- The finished task that created this repeat.
  add column if not exists repeat_of uuid,
  -- How often the due date was moved to a later day.
  add column if not exists reschedule_count integer not null default 0;

-- Row-level security: the browser talks to the database directly with a
-- public key, so these policies are what keep your tasks private. Every query
-- is automatically limited to rows where user_id is the signed-in user.
alter table public.tasks enable row level security;

drop policy if exists "read own tasks" on public.tasks;
create policy "read own tasks" on public.tasks
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "add own tasks" on public.tasks;
create policy "add own tasks" on public.tasks
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "change own tasks" on public.tasks;
create policy "change own tasks" on public.tasks
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- No delete policy on purpose: the app soft-deletes by setting deleted_at.

-- Send changes to open apps in real time, so a task added on the phone
-- appears on the laptop without a refresh.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end $$;

-- Focus timer: one row per finished focus session or break.
create table if not exists public.focus_sessions (
  id         uuid primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  task_id    uuid references public.tasks (id) on delete set null,
  kind       text not null check (kind in ('focus', 'short_break', 'long_break')),
  started_at timestamptz not null,
  ended_at   timestamptz not null
);

create index if not exists focus_sessions_user_ended_idx on public.focus_sessions (user_id, ended_at);

alter table public.focus_sessions enable row level security;

drop policy if exists "read own focus sessions" on public.focus_sessions;
create policy "read own focus sessions" on public.focus_sessions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "add own focus sessions" on public.focus_sessions;
create policy "add own focus sessions" on public.focus_sessions
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Needed for upsert, which saves a session at most once.
drop policy if exists "change own focus sessions" on public.focus_sessions;
create policy "change own focus sessions" on public.focus_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Reminders: when a timed task's notification was sent, so it's sent once.
-- Moving the task to a new time clears it, so the new time gets one too.
alter table public.tasks add column if not exists reminded_at timestamptz;

create or replace function public.reset_reminder()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.due_at is distinct from old.due_at then
    new.reminded_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_reset_reminder on public.tasks;
create trigger tasks_reset_reminder
  before update on public.tasks
  for each row execute function public.reset_reminder();

-- One row per device that turned reminders on (a browser push subscription).
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "read own push subscriptions" on public.push_subscriptions;
create policy "read own push subscriptions" on public.push_subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "add own push subscriptions" on public.push_subscriptions;
create policy "add own push subscriptions" on public.push_subscriptions
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "change own push subscriptions" on public.push_subscriptions;
create policy "change own push subscriptions" on public.push_subscriptions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "remove own push subscriptions" on public.push_subscriptions;
create policy "remove own push subscriptions" on public.push_subscriptions
  for delete to authenticated using (user_id = (select auth.uid()));
