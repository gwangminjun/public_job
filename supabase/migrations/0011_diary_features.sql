create index if not exists diary_entries_timeline_idx on public.diary_entries (entry_date desc, created_at desc, id desc);
create index if not exists diary_comments_entry_idx on public.diary_comments (entry_id, created_at);

create table if not exists public.diary_drafts (
  author text primary key check (author in ('A', 'B')),
  entry_date date not null,
  mood text,
  content text not null default '',
  version uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now()
);
alter table public.diary_drafts enable row level security;
