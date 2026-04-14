create table if not exists grandma_config (
  id int primary key default 1 check (id = 1),
  event_date date not null,
  event_time text not null,
  location text not null,
  location_detail text,
  host text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into grandma_config (id, event_date, event_time, location, location_detail, host)
values (1, '2026-04-25', '12:00', '가족 모임 장소', '추후 업데이트', '온 가족이 함께')
on conflict (id) do nothing;

create table if not exists grandma_timeline (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  title text not null,
  description text,
  emoji text,
  highlight boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into grandma_timeline (year, title, description, emoji, highlight, sort_order)
select *
from (
  values
    (1946, '탄생', '아름다운 세상에 첫 발을 내딛으셨습니다.', '👶', false, 10),
    (1952, '초등학교 입학', '설렘 가득한 마음으로 학교에 첫 발을 내딛으셨습니다.', '📚', false, 20),
    (1965, '결혼', '할아버지와 평생을 함께할 인연을 맺으셨습니다.', '💍', false, 30),
    (1967, '첫째 출산', '엄마라는 이름으로 새로운 인생을 시작하셨습니다.', '👶', false, 40),
    (1980, '자녀들 성장', '자식들의 건강한 성장을 위해 헌신적으로 돌봐주셨습니다.', '👨‍👩‍👧‍👦', false, 50),
    (1995, '첫 손자·손녀 탄생', '할머니가 되시는 기쁨을 처음으로 누리셨습니다.', '🍼', false, 60),
    (2010, '황혼의 여유', '자식들이 장성하여 여유로운 시간을 보내기 시작하셨습니다.', '🌅', false, 70),
    (2026, '팔순 기념', '온 가족이 함께 소중한 팔순을 축하합니다!', '🎂', true, 80)
) as defaults(year, title, description, emoji, highlight, sort_order)
where not exists (select 1 from grandma_timeline limit 1);

alter table grandma_photos add column if not exists sort_order int not null default 0;

with ordered as (
  select id, row_number() over (order by created_at asc, id asc) * 10 as next_sort_order
  from grandma_photos
)
update grandma_photos
set sort_order = ordered.next_sort_order
from ordered
where grandma_photos.id = ordered.id
  and grandma_photos.sort_order = 0;
