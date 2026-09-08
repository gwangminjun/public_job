-- 정보보안기사 체크리스트 (/study) 단일 사용자용 상태 저장
-- 로그인 없이 단일 row만 사용. RLS를 켜고 정책을 만들지 않아 anon/authenticated 클라이언트의
-- 직접 접근을 차단한다 — 오직 서비스 롤(API route)만 읽고 쓸 수 있다.

create table if not exists study_checklist_state (
  id text primary key default 'security-engineer-20260923',
  checked jsonb not null default '{}'::jsonb,
  memos jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table study_checklist_state enable row level security;

insert into study_checklist_state (id)
values ('security-engineer-20260923')
on conflict (id) do nothing;
