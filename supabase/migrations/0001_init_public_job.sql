-- Public Job Portal initial schema for Supabase (PostgreSQL)

create extension if not exists pgcrypto;
create extension if not exists citext;

do $$ begin
  create type check_interval_type as enum ('daily', 'hourly');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_channel as enum ('kakao', 'slack', 'telegram', 'email');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type dispatch_status as enum ('queued', 'sent', 'failed', 'skipped');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext,
  display_name varchar(80),
  status varchar(20) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_user_profiles_email on public.user_profiles(email);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language varchar(5) not null default 'ko',
  theme varchar(10) not null default 'system',
  timezone varchar(60) not null default 'Asia/Seoul',
  updated_at timestamptz not null default now()
);

create table if not exists public.job_posts (
  id uuid primary key default gen_random_uuid(),
  source varchar(30) not null,
  source_job_sn bigint not null,
  institution_name varchar(200) not null,
  title text not null,
  ncs_text text,
  hire_type_text text,
  work_region_text text,
  recruit_type_text text,
  recruit_count integer,
  start_ymd char(8),
  end_ymd char(8),
  ongoing_yn char(1),
  src_url text,
  raw_payload jsonb not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (source, source_job_sn)
);

create index if not exists idx_job_posts_institution_name on public.job_posts(institution_name);
create index if not exists idx_job_posts_end_ymd on public.job_posts(end_ymd);

create table if not exists public.user_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  job_post_id uuid not null references public.job_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_post_id)
);

create table if not exists public.user_recent_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_post_id uuid not null references public.job_posts(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists idx_user_recent_views_user_time on public.user_recent_views(user_id, viewed_at desc);

create table if not exists public.user_filter_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(80) not null,
  filters_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.institution_watch_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution_name varchar(200) not null,
  check_interval check_interval_type not null default 'daily',
  active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_watch_rules_user_active on public.institution_watch_rules(user_id, active);

create table if not exists public.notification_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel notification_channel not null,
  destination text not null,
  verified boolean not null default false,
  consented_at timestamptz,
  opted_out_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_targets_user_active on public.notification_targets(user_id, active);

create table if not exists public.notification_dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  watch_rule_id uuid references public.institution_watch_rules(id) on delete set null,
  target_id uuid references public.notification_targets(id) on delete set null,
  job_post_id uuid references public.job_posts(id) on delete set null,
  status dispatch_status not null,
  error_message text,
  attempted_at timestamptz not null default now(),
  sent_at timestamptz,
  idempotency_key varchar(191) not null unique
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_user_profiles on public.user_profiles;
create trigger set_updated_at_user_profiles
  before update on public.user_profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_user_preferences on public.user_preferences;
create trigger set_updated_at_user_preferences
  before update on public.user_preferences
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_user_filter_presets on public.user_filter_presets;
create trigger set_updated_at_user_filter_presets
  before update on public.user_filter_presets
  for each row execute procedure public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_bookmarks enable row level security;
alter table public.user_recent_views enable row level security;
alter table public.user_filter_presets enable row level security;
alter table public.institution_watch_rules enable row level security;
alter table public.notification_targets enable row level security;
alter table public.notification_dispatch_logs enable row level security;
alter table public.job_posts enable row level security;

drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own on public.user_profiles
  for select using (auth.uid() = id);

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own on public.user_profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists user_preferences_all_own on public.user_preferences;
create policy user_preferences_all_own on public.user_preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_bookmarks_all_own on public.user_bookmarks;
create policy user_bookmarks_all_own on public.user_bookmarks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_recent_views_all_own on public.user_recent_views;
create policy user_recent_views_all_own on public.user_recent_views
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists user_filter_presets_all_own on public.user_filter_presets;
create policy user_filter_presets_all_own on public.user_filter_presets
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists institution_watch_rules_all_own on public.institution_watch_rules;
create policy institution_watch_rules_all_own on public.institution_watch_rules
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists notification_targets_all_own on public.notification_targets;
create policy notification_targets_all_own on public.notification_targets
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists dispatch_logs_select_own on public.notification_dispatch_logs;
create policy dispatch_logs_select_own on public.notification_dispatch_logs
  for select using (auth.uid() = user_id);

drop policy if exists job_posts_public_read on public.job_posts;
create policy job_posts_public_read on public.job_posts
  for select using (true);
