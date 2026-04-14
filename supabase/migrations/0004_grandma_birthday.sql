-- ================================================
-- 할머니 팔순잔치 기념 사이트
-- ================================================

-- 방명록 테이블
create table if not exists grandma_guestbook (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 20),
  message    text not null check (char_length(message) between 1 and 300),
  emoji      text not null default '❤️',
  created_at timestamptz not null default now()
);

-- 사진 메타데이터 테이블
create table if not exists grandma_photos (
  id          uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption     text,
  taken_year  int,
  created_at  timestamptz not null default now()
);

-- RLS 활성화
alter table grandma_guestbook enable row level security;
alter table grandma_photos enable row level security;

-- 방명록: 모두 읽기 가능
create policy "grandma_guestbook_select"
  on grandma_guestbook for select using (true);

-- 방명록: 모두 작성 가능 (비로그인 포함)
create policy "grandma_guestbook_insert"
  on grandma_guestbook for insert with check (true);

-- 방명록: 삭제는 인증 사용자만
create policy "grandma_guestbook_delete"
  on grandma_guestbook for delete using (auth.role() = 'authenticated');

-- 사진: 모두 읽기 가능
create policy "grandma_photos_select"
  on grandma_photos for select using (true);

-- 사진: 인증 사용자만 업로드/삭제
create policy "grandma_photos_insert"
  on grandma_photos for insert with check (auth.role() = 'authenticated');

create policy "grandma_photos_delete"
  on grandma_photos for delete using (auth.role() = 'authenticated');

-- Storage bucket (Supabase 대시보드에서 직접 생성 필요)
-- bucket name: grandma-photos
-- public: true
