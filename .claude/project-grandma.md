# 할머니 팔순잔치 기념 미니사이트

공공기관 채용 포털(`public_job`) 레포 내 `/grandma` 경로에서 운영되는 별도 서비스.  
가족 전용 팔순(80세) 잔치 기념 사이트로, 독립 레이아웃·테마를 갖는다.

- 배포 URL: `https://public-job.vercel.app/grandma`
- 관리자 URL: `https://public-job.vercel.app/grandma/admin` (인증 없음 — 가족 한정 비공개 URL)

---

## 디자인 토큰 (인라인 style 사용, Tailwind 미적용)

| 용도 | 색상 |
|---|---|
| 주요 텍스트 | `#5C3317` |
| 보조 텍스트 | `#7B4F2E` |
| 힌트 텍스트 | `#A07850` |
| 입력 글자 | `#3B1F0E` |
| 입력 배경 | `#FFFDF7` |
| 카드 배경 | `#FFFAF3` |
| 카드 테두리 | `#E8C99A` |
| 페이지 배경 | `#FFF8EE` |
| 헤더·버튼 | `#7B4F2E` |

> input·select·textarea에는 `color`와 `backgroundColor`를 항상 인라인으로 명시할 것.  
> CSS 속성 `focusRingColor`는 지원되지 않으므로 사용 금지.

---

## 페이지 구조

| 경로 | 파일 | 설명 |
|---|---|---|
| `/grandma` | `src/app/grandma/page.tsx` | 메인 (카운트다운, 잔치안내, QR, 메뉴) |
| `/grandma/timeline` | `src/app/grandma/timeline/page.tsx` | 80년 인생 타임라인 |
| `/grandma/gallery` | `src/app/grandma/gallery/page.tsx` | 사진첩 (SSR, `revalidate = 60`) |
| `/grandma/guestbook` | `src/app/grandma/guestbook/page.tsx` | 방명록 |
| `/grandma/video` | `src/app/grandma/video/page.tsx` | 축하 영상 (YouTube/Vimeo embed) |
| `/grandma/admin` | `src/app/grandma/admin/page.tsx` | 통합 관리 (잔치정보·타임라인·사진·영상) |

공통 레이아웃: `src/app/grandma/layout.tsx` — Georgia 폰트, `#FFF8EE` 배경, 갈색 헤더·푸터.

---

## 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `Countdown` | D-day 실시간 카운트다운 (클라이언트) |
| `GrandmaHeroShowcase` | 메인 히어로 사진 슬라이드 (5초 자동 전환) + 잔치 당일 특별 모드 |
| `GrandmaNavigation` | 모바일 하단 탭 바 + 데스크탑 상단 메뉴 |
| `PhotoGallery` | 그리드(모바일 2열·데스크탑 4열) + 라이트박스 + 연도 필터 |
| `PhotoAdmin` | 사진 업로드(멀티 선택·미리보기)·삭제 |
| `GuestbookForm` | 이모지 선택 + 이름 + 메시지 입력 |
| `GuestbookList` | 방명록 목록 (`date-fns` ko 로케일 상대시간) |
| `TimelineAdmin` | 타임라인 CRUD (관리자) |
| `EventConfigAdmin` | 잔치정보(날짜·장소·주최) 편집 (관리자) |
| `GrandmaVideoAdmin` | 축하 영상 URL 등록·삭제 (관리자) |
| `GrandmaVideoCard` | YouTube/Vimeo embed 또는 직접 URL 재생 |
| `GrandmaAdminTabs` | 관리자 탭 컨테이너 (잔치정보·타임라인·사진·영상) |
| `GrandmaPrintButton` | 사진첩 인쇄 (`window.print()`) |

---

## 서버 유틸리티

### `src/lib/grandma/shared.ts`
공유 타입·상수·순수 함수. 클라이언트·서버 모두 import 가능.

- `GrandmaEventConfig`, `GrandmaPhoto`, `GrandmaTimelineEvent`, `GrandmaGuestbookEntry` 타입
- `DEFAULT_GRANDMA_EVENT_CONFIG`, `DEFAULT_GRANDMA_TIMELINE` — DB 미설정 시 폴백
- `buildEventDateTime(config)` → ISO 8601 문자열 (Asia/Seoul +09:00)
- `isGrandmaEventDay(eventDate)` → 잔치 당일 여부 (서울 시간 기준)
- `getEmbedVideoUrl(url)` → YouTube/Vimeo embed URL 변환
- `getGrandmaSiteUrl()` → `NEXT_PUBLIC_SITE_URL` 기반 사이트 URL

### `src/lib/grandma/server.ts`
Supabase admin client로 DB 조회. 서버 컴포넌트·Route Handler 전용.

- `getGrandmaConfig()` — `grandma_config` (id=1, 단일 행), DB 없으면 DEFAULT 반환
- `getGrandmaTimeline()` — `grandma_timeline`, DB 없으면 DEFAULT 반환
- `getGrandmaPhotos()` — `grandma_photos`, publicUrl 자동 포함
- `getGrandmaHeroPhotos(limit=5)` — 메인 히어로용 상위 N장
- `getGrandmaGuestbook()` — `grandma_guestbook`, 최신순

### `src/lib/grandma/moderation.ts`
방명록 입력 검증 로직.

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET/POST | `/api/grandma/photos` | 사진 목록 조회 / 업로드 (multipart/form-data) |
| DELETE | `/api/grandma/photos/[id]` | 사진 삭제 (Storage + DB 원자적) |
| POST | `/api/grandma/photos/reorder` | 사진 순서 변경 |
| GET/POST | `/api/grandma/timeline` | 타임라인 목록 / 이벤트 추가 |
| PUT/DELETE | `/api/grandma/timeline/[id]` | 타임라인 이벤트 수정·삭제 |
| GET/POST | `/api/grandma/guestbook` | 방명록 목록 / 작성 |
| DELETE | `/api/grandma/guestbook/[id]` | 방명록 삭제 |
| GET/PUT | `/api/grandma/config` | 잔치정보 조회·수정 |
| GET/POST/DELETE | `/api/grandma/videos` | 축하 영상 관리 |

사진 업로드 흐름:
1. `POST /api/grandma/photos` → Storage `grandma-photos` 버킷 업로드
2. `grandma_photos` 테이블에 메타 INSERT (`sort_order` = 기존 최대 + 10)
3. Storage 업로드 성공 후 DB 실패 시 Storage 파일 롤백
4. `revalidatePath('/grandma/gallery')`, `revalidatePath('/grandma/admin')` 호출

---

## Supabase 설정

### Storage 버킷

| 버킷 | 공개 |
|---|---|
| `grandma-photos` | Public |
| `grandma-videos` | Public |

### 테이블

```sql
grandma_config (
  id            int primary key default 1,
  event_date    text,   -- 'YYYY-MM-DD'
  event_time    text,   -- 'HH:MM'
  location      text,
  location_detail text,
  host          text,
  celebration_video_title text,
  celebration_video_url   text
);

grandma_photos (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption      text,
  taken_year   int,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

grandma_guestbook (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  message    text not null,
  emoji      text not null default '❤️',
  created_at timestamptz default now()
);

grandma_timeline (
  id          uuid primary key default gen_random_uuid(),
  year        int not null,
  title       text not null,
  description text,
  emoji       text,
  highlight   boolean default false,
  sort_order  int default 0
);
```

### RLS 정책 요약

- `grandma_photos`: anon/authenticated SELECT·INSERT·DELETE 모두 허용
- `grandma_guestbook`: anon/authenticated SELECT·INSERT 허용
- Storage `grandma-photos`: anon/authenticated INSERT·DELETE 허용

---

## 잔치 당일 특별 모드

`isGrandmaEventDay(config.event_date)` 반환값이 `true`일 때  
`GrandmaHeroShowcase` 가 특별 배너·꽃가루 애니메이션을 표시.  
잔치 날짜: `2026-04-25` (기본값, 관리자 페이지에서 변경 가능).
