# Supabase 적용 가이드

## 1. 환경 변수

`.env.local` 파일에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_DEPLOY_DOMAIN
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
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

## 3-1. 인증 리다이렉트 URL 설정(중요)

Supabase Dashboard > Authentication > URL Configuration에서 아래를 확인합니다.

- Site URL: `https://YOUR_DEPLOY_DOMAIN`
- Redirect URLs:
  - `https://YOUR_DEPLOY_DOMAIN/auth/login`
  - (선택) `http://localhost:3000/auth/login`

`/auth/login` 페이지는 회원가입/인증메일 재전송 시 `emailRedirectTo`로 사용됩니다.

## 4. 다음 구현 단계(권장)

1. Auth UI(로그인/회원가입) 구현
2. 기존 `localStorage` 데이터 최초 로그인 시 1회 업로드 API 구현
3. 북마크/프리셋/최근 본 조회를 Supabase 기반으로 전환
4. 기관 watch + 일일 알림 배치(worker/cron) 연결
