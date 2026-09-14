-- 커플 일기장 (/diary) — 작성자 2명 고정(A/B), 시크릿 헤더 인증(서비스 롤 전용)
-- RLS를 켜고 정책을 만들지 않아 anon/authenticated 클라이언트의 직접 접근을 차단한다 —
-- 오직 서비스 롤(API route)만 읽고 쓸 수 있다 (study_checklist_state와 동일 패턴).

create table if not exists diary_entries (
  id          uuid primary key default gen_random_uuid(),
  author      text not null check (author in ('A', 'B')),
  entry_date  date not null,
  mood        text,
  content     text not null,
  photo_paths text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists diary_comments (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references diary_entries(id) on delete cascade,
  author     text not null check (author in ('A', 'B')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table diary_entries enable row level security;
alter table diary_comments enable row level security;

insert into storage.buckets (id, name, public)
values ('diary-photos', 'diary-photos', false)
on conflict (id) do update
set public = excluded.public;
