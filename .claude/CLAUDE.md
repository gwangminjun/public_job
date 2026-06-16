# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run perf:audit   # Build + Lighthouse mobile+desktop audit (requires Chrome)
```

No test suite is configured.

## Environment Variables

Create `.env.local`:

```env
DATA_GO_KR_API_KEY=...                        # 공공데이터포털 서비스키
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://...              # 배포 도메인 (auth redirect 기준)
OPS_HEALTHCHECK_SECRET=...                    # /api/ops/db-health 헤더 인증
CRON_SECRET=...                               # /api/cron/* POST 헤더 인증 (x-cron-secret)
```

## Projects

이 레포에는 두 개의 독립적인 서비스가 공존합니다. 각 프로젝트의 상세 문서를 참고하세요.

- **공공기관 채용정보 포털** → [`.claude/project-public-job.md`](project-public-job.md)
- **할머니 팔순잔치 기념 사이트** → [`.claude/project-grandma.md`](project-grandma.md)

## Architecture

### Two sites in one repo

- **Main site** (`/`, `/jobs`, `/bookmarks`, `/account`, `/auth`): 공공기관 채용정보 포털
- **Grandma sub-site** (`/grandma/*`): 팔순잔치 기념 미니사이트 (별도 레이아웃 `src/app/grandma/layout.tsx`, 갈색 계열 테마)

### Data flow — job listings

1. `useFilterStore` (Zustand) holds all filter/sort/pagination state.
2. `useJobs` hook (`src/hooks/useJobs.ts`) reads the store and calls `/api/jobs` via TanStack Query (staleTime 5 min).
3. `/api/jobs` (`src/app/api/jobs/route.ts`) proxies `apis.data.go.kr/1051000/recruitment/list`, applies server-side filtering/sorting/pagination, and keeps an **in-memory cache** for 5 minutes. All 1000 records are fetched once; filtering is done in memory.
4. Job date fields (`pbancBgngYmd`, `pbancEndYmd`) are `YYYYMMDD` strings — convert with `date-fns/parseISO` after inserting dashes.

### State management

| Store | Purpose |
|---|---|
| `filterStore` | Search filters, sort, pagination (not persisted) |
| `bookmarkStore` | Bookmarked job SNs (localStorage via Zustand persist) |
| `recentViewedStore` | Recently viewed jobs, max 10 (localStorage) |
| `filterPresetStore` | Saved filter presets (localStorage) |

On first login, `LocalToDbMigration` component migrates localStorage data to Supabase via `/api/account/migrate-local`.

### Supabase clients

| File | Use |
|---|---|
| `src/lib/supabase/client.ts` | Browser (client components) |
| `src/lib/supabase/server.ts` | Server components / Route Handlers (reads cookies) |
| `src/lib/supabase/admin.ts` | Service-role operations (cron, ops) — never expose to client |

Session refresh runs in `middleware.ts` via `updateSupabaseSession` on all non-static routes.

### Cron / notifications

`POST /api/cron/institution-watch` — called by an external scheduler with header `x-cron-secret`. It:
1. Fetches all jobs from data.go.kr
2. Upserts into `job_posts` table
3. Matches active `institution_watch_rules` against fetched jobs
4. Sends Slack webhook notifications via `src/lib/server/slack.ts`
5. Logs results in `notification_dispatch_logs` with idempotency keys

### Key DB tables (Supabase / PostgreSQL)

`users`, `user_preferences`, `user_bookmarks`, `user_recent_views`, `user_filter_presets`, `institution_watch_rules`, `notification_targets`, `notification_dispatch_logs`, `job_posts` — see `DATABASE_DESIGN.md` for full schema and DDL.

Grandma tables: `grandma_photos` (Storage: `grandma-photos` bucket, public), `grandma_guestbook` — see `GRANDMA.md`.

### Provider tree

`I18nProvider` → `QueryClientProvider` → `ThemeProvider` (next-themes, `attribute="class"`) → children

i18n: `i18next` + `i18next-browser-languagedetector`, supports `ko`/`en`.

### Deployment

Deployed on Vercel. `main` branch auto-deploys. See `DEPLOY.md` for environment variable setup. The `/grandma` sub-site is at `https://public-job.vercel.app/grandma`.
