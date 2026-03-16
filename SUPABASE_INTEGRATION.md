# Supabase 적용 가이드

## 1. 환경 변수

`.env.local` 파일에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_DEPLOY_DOMAIN
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
OPS_HEALTHCHECK_SECRET=YOUR_RANDOM_HEALTHCHECK_SECRET
```

## 2. 스키마 적용

Supabase Dashboard > SQL Editor에서 아래 파일 내용을 실행합니다.

- `supabase/migrations/0001_init_public_job.sql`

이 스크립트는 다음을 포함합니다.

- 사용자 프로필/환경설정/북마크/최근 본/필터 프리셋 테이블
- 기관 watch/알림 대상/발송 로그 테이블
- `auth.users` 가입 시 profile/preferences 자동 생성 트리거
- RLS 및 사용자 소유 데이터 정책

## 3. 코드 연동 지점

- 브라우저 클라이언트: `src/lib/supabase/client.ts`
- 서버 클라이언트: `src/lib/supabase/server.ts`
- 관리자(서비스롤) 클라이언트: `src/lib/supabase/admin.ts`
- 세션 갱신 미들웨어: `src/lib/supabase/middleware.ts`, `middleware.ts`
- 로컬 데이터 마이그레이션 API: `src/app/api/account/migrate-local/route.ts`
- 운영용 DB 헬스체크 API: `src/app/api/ops/db-health/route.ts`

## 3-1. 인증 리다이렉트 URL 설정(중요)

Supabase Dashboard > Authentication > URL Configuration에서 아래를 확인합니다.

- Site URL: `https://YOUR_DEPLOY_DOMAIN`
- Redirect URLs:
  - `https://YOUR_DEPLOY_DOMAIN/auth/login`
  - (선택) `http://localhost:3000/auth/login`

`/auth/login` 페이지는 회원가입/인증메일 재전송 시 `emailRedirectTo`로 사용됩니다.

## 4. 운영 알림(헬스체크) 연동

`OPS_HEALTHCHECK_SECRET`를 설정하면 `/api/ops/db-health` 호출 시 헤더 인증이 필요합니다.

- 요청 헤더: `x-ops-secret: <OPS_HEALTHCHECK_SECRET>`
- 용도: 외부 업타임 모니터링(UptimeRobot, Better Stack 등)에서 주기 호출

응답 예시:

```json
{ "ok": true, "checkedAt": "2026-03-10T00:00:00.000Z" }
```

## 5. 다음 구현 단계(권장)

1. 북마크/프리셋/최근 본 조회를 Supabase 기반으로 완전 전환
2. 기관 watch + 일일 알림 배치(worker/cron) 연결
3. 백업/복구 리허설(복원 테스트) 분기별 운영 작업화

## 6. Troubleshooting: "could not find the table ... in the schema cache"

계정 저장 시 `public.user_profiles`/`public.user_preferences` 관련 스키마 캐시 에러가 발생하면 아래 순서로 복구합니다.

1. `supabase/migrations/0001_init_public_job.sql`를 SQL Editor에서 실행
2. PostgREST 스키마 캐시 리로드

```sql
NOTIFY pgrst, 'reload schema';
```

3. (필요 시) 알림 큐 상태 점검

```sql
SELECT pg_notification_queue_usage();
```

4. Supabase Dashboard > Settings > API에서 `public` 스키마가 Exposed Schemas에 포함되었는지 확인
