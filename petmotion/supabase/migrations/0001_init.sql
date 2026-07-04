-- PetMotion initial schema (spec §4)
-- Run: supabase db push  (or apply via the SQL editor)

-- ---------------------------------------------------------------------------
-- profiles: extends auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  created_at timestamptz default now(),
  rc_app_user_id text,
  generations_this_week int default 0,
  week_reset_at timestamptz,
  generations_today int default 0,
  day_reset_at timestamptz,
  expo_push_token text
);

-- Auto-create a profile row whenever a new auth user (incl. anonymous) appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- templates: remote-configurable catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.templates (
  id text primary key,
  title text not null,
  category text not null check (category in ('funny','heartwarming','epic','seasonal')),
  preview_url text not null,
  prompt text not null,               -- server-side only; never selected by client
  duration_seconds int default 5,
  aspect_ratio text default '9:16',
  audio_enabled boolean default true,
  sort_order int default 0,
  is_active boolean default true
);

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  template_id text references public.templates(id) not null,
  status text default 'queued' check (status in ('queued','submitted','processing','succeeded','failed')),
  input_image_path text not null,
  provider text default 'byteplus',
  provider_task_id text,
  output_video_url text,
  output_storage_path text,
  error text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index if not exists jobs_user_id_created_idx on public.jobs (user_id, created_at desc);
create index if not exists jobs_status_idx on public.jobs (status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.jobs enable row level security;

-- profiles: a user can read/update only their own row.
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

-- templates: public read of active templates; writes are service-role only.
drop policy if exists "templates public read" on public.templates;
create policy "templates public read" on public.templates
  for select using (is_active = true);

-- jobs: users can read only their own jobs. Inserts/updates go through the
-- create-job / get-job Edge Functions using the service role (which bypasses
-- RLS), so there is intentionally no client insert/update policy.
drop policy if exists "own jobs read" on public.jobs;
create policy "own jobs read" on public.jobs
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Quota helpers (called from Edge Functions with the service role)
-- ---------------------------------------------------------------------------

-- Rolls the weekly/daily counters if their window has elapsed, then returns the
-- current counters so the caller can enforce limits before submitting a job.
create or replace function public.roll_and_get_counters(p_user uuid)
returns table (generations_this_week int, generations_today int)
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles p
  set
    generations_this_week = case
      when p.week_reset_at is null or p.week_reset_at < now()
        then 0 else p.generations_this_week end,
    week_reset_at = case
      when p.week_reset_at is null or p.week_reset_at < now()
        then now() + interval '7 days' else p.week_reset_at end,
    generations_today = case
      when p.day_reset_at is null or p.day_reset_at < now()
        then 0 else p.generations_today end,
    day_reset_at = case
      when p.day_reset_at is null or p.day_reset_at < now()
        then date_trunc('day', now()) + interval '1 day' else p.day_reset_at end
  where p.id = p_user;

  return query
    select p.generations_this_week, p.generations_today
    from public.profiles p where p.id = p_user;
end;
$$;

-- Increment counters only on a successful generation (spec §5).
create or replace function public.increment_usage(p_user uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles
  set generations_this_week = generations_this_week + 1,
      generations_today = generations_today + 1
  where id = p_user;
$$;

-- Count all successful jobs created today across all users (kill-switch).
create or replace function public.global_jobs_today()
returns int
language sql
security definer set search_path = public
as $$
  select count(*)::int from public.jobs
  where created_at >= date_trunc('day', now())
    and status in ('submitted','processing','succeeded');
$$;
