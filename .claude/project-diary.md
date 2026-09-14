# 우리 둘의 일기장 (`/diary/*`)

작성자 2명(A/B) 고정, 비공개 커플 일기장. 회원가입/로그인 없이 시크릿 헤더 인증만 사용.

## 인증

- `DIARY_SECRET_A`, `DIARY_SECRET_B` (서버 전용 env, `NEXT_PUBLIC_` 아님 — study 체크리스트와 달리 클라이언트 번들에 절대 노출하지 않음)
- 브라우저에서 최초 접속 시 `DiaryAuthGate`가 비밀번호 입력을 받아 `localStorage`(`diary-secret`)에 저장
- 이후 모든 API 요청은 `diaryFetch`(`src/lib/diary/client.ts`)로 `x-diary-secret` 헤더를 자동 첨부
- 서버는 `requireDiaryAuthor()`(`src/lib/diary/auth.ts`)로 헤더 값을 검증해 작성자(A/B)를 판별 — GET 포함 모든 라우트에서 필수

## 페이지

| 경로 | 파일 | 설명 |
|---|---|---|
| `/diary` | `src/app/diary/page.tsx` | 타임라인 (최신순) |
| `/diary/calendar` | `src/app/diary/calendar/page.tsx` | 월별 캘린더, 날짜별 무드 이모지, 날짜 클릭 시 일기 상세/작성으로 이동 |
| `/diary/write` | `src/app/diary/write/page.tsx` | 작성 (날짜·무드·내용·사진 여러 장) |
| `/diary/[id]` | `src/app/diary/[id]/page.tsx` | 상세 + 댓글 목록/작성/삭제 |

공통 레이아웃: `src/app/diary/layout.tsx` — 로즈 테마, `DiaryAuthGate`로 전체 감쌈.

## 데이터

Supabase 테이블은 RLS를 켜고 정책을 만들지 않아 서비스 롤(API route)만 접근 가능 (`study_checklist_state`와 동일 패턴).

```sql
diary_entries (
  id, author('A'|'B'), entry_date, mood, content, photo_paths(text[]), created_at, updated_at
)
diary_comments (
  id, entry_id → diary_entries, author('A'|'B'), content, created_at
)
```

Storage 버킷 `diary-photos`는 **비공개**(grandma-photos와 달리 public=false). 조회 시 서버에서 `createSignedUrl`로 1시간 유효 URL을 발급 (`src/lib/diary/server.ts`의 `mapDiaryEntryRow`).

## API

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET/POST | `/api/diary/entries` | 목록 조회 / 작성 (multipart, 사진 업로드 포함) |
| GET/PUT/DELETE | `/api/diary/entries/[id]` | 상세(댓글 포함)/수정/삭제 (삭제 시 Storage 사진도 정리) |
| POST | `/api/diary/entries/[id]/comments` | 댓글 작성 |
| DELETE | `/api/diary/comments/[id]` | 댓글 삭제 |

## 스킵한 것 (필요 시 추가)

- 일기 수정 시 사진 교체 (현재 PUT은 텍스트/무드/날짜만 수정)
- 댓글 알림, Slack 연동
