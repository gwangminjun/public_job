# 공공기관 채용정보 포털

공공데이터포털(`data.go.kr`) API를 프록시하여 공공기관 채용공고를 조회·필터링·알림하는 메인 서비스.

- 배포 URL: `https://public-job.vercel.app`
- 진입 페이지: `src/app/public-job/page.tsx` (실제 UI), `src/app/page.tsx` (redirect)

---

## 페이지 구조

| 경로 | 설명 |
|---|---|
| `/` | `/public-job`로 리다이렉트 |
| `/public-job` | 메인 채용공고 목록 (검색/필터/뷰 전환) |
| `/jobs/[sn]` | 공고 상세 페이지 (SSR, `recrutPblntSn` 기준) |
| `/bookmarks` | 북마크한 공고 목록 |
| `/account` | 계정·기관watch·Slack알림 관리 |
| `/auth/login` | Supabase 이메일 로그인·회원가입 |

---

## 데이터 흐름

```
useFilterStore (Zustand)
  └─ useJobs hook (TanStack Query, staleTime 5분)
       └─ GET /api/jobs
            └─ apis.data.go.kr/1051000/recruitment/list
                 ┌─ 1000건 일괄 fetch → in-memory 캐시 5분
                 └─ 서버에서 필터링·정렬·페이지네이션 후 반환
```

지도/인사이트 뷰는 `useMapJobs` 훅으로 별도 쿼리 (페이지네이션 없이 전체 결과).

---

## 뷰 모드 (공고 목록 페이지)

- **list**: `JobList` + `JobModal` (기본)
- **calendar**: `JobCalendar` — 북마크된 공고만 마감일 기준 표시
- **map**: `JobMapView` — Leaflet 기반, 근무지역 텍스트 파싱 후 마커 클러스터링
- **insight**: `JobTrendDashboard` — 지역·고용형태·기관 분포 차트

JobCalendar, JobMapView, JobTrendDashboard는 `next/dynamic`으로 lazy load (MapView는 `ssr: false`).

---

## 상태 관리

| 스토어 | 위치 | 지속성 |
|---|---|---|
| `filterStore` | `src/store/filterStore.ts` | 세션 메모리 (비지속) |
| `bookmarkStore` | `src/store/bookmarkStore.ts` | localStorage |
| `recentViewedStore` | `src/store/recentViewedStore.ts` | localStorage, 최대 10개 |
| `filterPresetStore` | `src/store/filterPresetStore.ts` | localStorage |

로그인 첫 성공 시 `LocalToDbMigration` 컴포넌트가 localStorage → Supabase DB로 1회 마이그레이션.

---

## API 엔드포인트

### 공고
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/jobs` | 목록 (필터·정렬·페이지네이션, in-memory 캐시) |
| GET | `/api/jobs/[sn]` | 상세 (외부 API 직접 호출) |
| GET | `/api/jobs/suggestions` | 검색어 자동완성 |

### 계정
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/account/profile` | 프로필·환경설정 저장 |
| GET/POST | `/api/account/watch-rules` | 기관 watch 목록·추가 |
| DELETE | `/api/account/watch-rules/[id]` | 기관 watch 삭제 |
| GET/POST | `/api/account/notification-targets` | Slack webhook 등록 |
| DELETE | `/api/account/notification-targets/[id]` | Slack 연동 해제 |
| GET | `/api/account/user-data` | 북마크·최근 본·프리셋 일괄 조회 |
| POST | `/api/account/migrate-local` | localStorage → DB 마이그레이션 |
| POST | `/api/account/delete` | 회원 탈퇴 (cascade) |

### Cron / 운영
| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| POST | `/api/cron/institution-watch` | `x-cron-secret` | 기관 watch + Slack 알림 발송 |
| GET | `/api/ops/db-health` | `x-ops-secret` | DB 헬스체크 |

---

## 기관 Watch & 알림 파이프라인

1. 외부 스케줄러가 `POST /api/cron/institution-watch` 호출 (헤더: `x-cron-secret`)
2. data.go.kr에서 1000건 fetch → `job_posts` 테이블 upsert
3. 활성 `institution_watch_rules` 조회 → 기관명 부분 매칭
4. `notification_targets` (channel=slack, verified=true) 조회
5. idempotency_key = `{rule_id}:{target_id}:{job_sn}` 로 중복 방지
6. `notification_dispatch_logs` 에 queued 기록 후 Slack webhook 발송
7. 성공 → sent, 실패 → failed + error_message 업데이트

알림 채널은 현재 **Slack Incoming Webhook** 만 구현. (`src/lib/server/slack.ts`)

---

## Job 타입 주요 필드

```ts
recrutPblntSn  // 공고 일련번호 (PK 역할)
instNm         // 기관명
recrutPbancTtl // 공고 제목
pbancBgngYmd   // 공고시작일 YYYYMMDD 문자열
pbancEndYmd    // 공고종료일 YYYYMMDD 문자열
decimalDay     // D-day (서버에서 추가, 음수=마감)
ongoingYn      // 'Y' | 'N' (서버에서 재계산)
```

날짜 변환 시 반드시 `parseISO`에 `-` 삽입 후 사용:
```ts
`${ymd.slice(0,4)}-${ymd.slice(4,6)}-${ymd.slice(6,8)}`
```

---

## i18n

`i18next` + `i18next-browser-languagedetector`. 언어 파일 위치: `public/locales/` 또는 인라인 리소스.  
컴포넌트에서 `useTranslation()` 훅, 키는 `home.heroTitle` 형태.  
사용자 언어 설정은 `user_preferences.language` (ko/en) 에 저장.

---

## PWA

`src/components/PwaRegister.tsx`가 `public/sw.js` 서비스워커를 등록.  
`src/app/manifest.ts`에서 Web App Manifest 생성.  
오프라인 fallback: `public/offline.html`.
