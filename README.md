# 공공기관 채용정보 포털

공공데이터포털 API를 활용한 공공기관 채용정보 포털 사이트입니다.

## 주요 기능

- **채용공고 검색**: 공고명, 기관명으로 실시간 검색
- **다중 필터링**: 지역(18개), 고용형태(7종), 채용구분(4종), 직무분야 NCS(24종), 학력(7종)
- **진행 중 공고 필터**: 마감일이 지나지 않은 공고만 표시
- **실시간 통계**: 총 공고 수, 마감 임박, 신규 공고, 등록 기관 수
- **D-day 표시**: 공고 마감까지 남은 일수 표시
- **뱃지 시스템**: NEW, 진행중, 고용형태, 채용구분 시각적 표현
- **모달/상세 페이지**: 채용공고 상세정보 조회
- **외부 링크**: 원본 공고, 잡알리오 지원 링크 제공
- **다크 모드**: 시스템 테마 연동 + 헤더 토글로 라이트/다크 전환
- **최근 본 공고**: 최근 열람 공고 자동 저장 및 빠른 재열람 (최대 10개 저장, 메인 5개 노출, 메인 콘텐츠 하단 배치)
- **필터 프리셋**: 검색 조건 저장/불러오기/삭제 (초기 화면 숨김, 헤더의 관심공고 옆 '필터 프리셋' 버튼으로 열기)
- **채용 캘린더 뷰**: 리스트/캘린더 전환으로 마감일 기반 월간 탐색
- **즐겨찾기 전용 캘린더**: 캘린더 모드에서 북마크 공고만 표시
- **지역별 지도 뷰**: Leaflet + OpenStreetMap 기반 공고 분포 확인
- **커스텀 지도 마커**: D-day 기준(긴급/임박/일반/마감)으로 마커 색상 구분
- **클러스터 마커 시각화**: 클러스터 크기별 디자인 + 카운트 라벨 + 대형 클러스터 펄스 강조
- **마커 아이콘 안정화**: Leaflet 기본 아이콘 경로 고정(`public/leaflet`)으로 깨짐 이슈 방지
- **채용 트렌드 대시보드**: 지역/채용구분/월별 공고 추이 차트 제공
- **공고 비교 패널**: 2~3개 공고를 선택해 기관/지역/자격요건/급여정보 힌트 비교
- **기관별 모아보기**: 등록 기관 클릭 시 기관명 기준 그룹 목록으로 확인
- **일정 내보내기(ICS)**: 채용공고 마감일을 캘린더 일정 파일로 저장
- **검색 자동완성**: 기관명/직무 키워드 기반 실시간 추천 드롭다운
- **PWA 지원**: 서비스워커 기반 오프라인 캐시 및 홈 화면 설치 지원
- **다국어 UI**: i18next 기반 한국어/영어 전환 지원

## 기술 스택

### Frontend

- **Framework**: Next.js 16.1.4 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **상태관리**: Zustand 5.0.10
- **데이터 페칭**: TanStack React Query 5.90.20
- **날짜 처리**: date-fns 4.1.0

### 배포

- **호스팅**: Vercel
- **리전**: icn1 (인천)

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   └── jobs/
│   │       ├── route.ts              # GET /api/jobs - 채용공고 목록
│   │       ├── suggestions/route.ts  # GET /api/jobs/suggestions - 자동완성
│   │       └── [sn]/route.ts         # GET /api/jobs/[sn] - 채용공고 상세
│   ├── jobs/
│   │   └── [sn]/page.tsx             # 채용공고 상세 페이지
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── manifest.ts                   # PWA 매니페스트
│   ├── page.tsx                      # 메인 페이지
│   └── globals.css
├── components/
│   ├── I18nProvider.tsx              # i18next 초기화/언어 동기화
│   ├── PwaRegister.tsx               # 서비스워커 등록
│   ├── layout/
│   │   ├── Header.tsx                # 헤더
│   │   ├── Footer.tsx                # 푸터
│   │   └── SearchFilter.tsx          # 검색 및 필터
│   ├── jobs/
│   │   ├── JobCard.tsx               # 채용공고 카드
│   │   ├── JobList.tsx               # 채용공고 목록
│   │   ├── JobCalendar.tsx           # 채용공고 캘린더 뷰
│   │   ├── JobMapView.tsx            # 채용공고 지도 뷰 + 마커/클러스터
│   │   └── JobModal.tsx              # 채용공고 모달
│   ├── stats/
│   │   ├── StatsPanel.tsx            # 통계 패널
│   │   └── JobTrendDashboard.tsx     # 트렌드 차트 + 공고 비교
│   ├── ui/
│   │   ├── Badge.tsx                 # 뱃지
│   │   ├── Pagination.tsx            # 페이지네이션
│   │   └── Skeleton.tsx              # 스켈레톤 로딩
│   └── Providers.tsx                 # React Query + Theme 프로바이더
├── hooks/
│   ├── useJobs.ts                    # 채용공고 목록 fetch
│   ├── useMapJobs.ts                 # 지도 전용 채용공고 fetch
│   └── useJobDetail.ts               # 채용공고 상세 fetch
├── i18n/
│   ├── client.ts                     # i18next 클라이언트 설정
│   └── resources.ts                  # ko/en 번역 리소스
├── lib/supabase/
│   ├── env.ts                        # Supabase 환경변수 로더
│   ├── client.ts                     # 브라우저용 Supabase 클라이언트
│   ├── server.ts                     # 서버용 Supabase 클라이언트
│   ├── admin.ts                      # 서비스 롤용 Supabase 클라이언트
│   └── middleware.ts                 # Supabase 세션 갱신 헬퍼
├── store/
│   ├── filterStore.ts                # Zustand 필터 상태 관리
│   ├── bookmarkStore.ts              # 관심 공고 저장
│   ├── recentViewedStore.ts          # 최근 본 공고 저장
│   └── filterPresetStore.ts          # 필터 프리셋 저장
└── lib/
    ├── types.ts                      # TypeScript 타입 정의
    └── utils.ts                      # 유틸리티 함수 및 상수

public/
├── sw.js                             # 서비스워커
├── offline.html                      # 오프라인 폴백 페이지
├── icon-192.svg                      # PWA 아이콘(192)
└── icon-512.svg                      # PWA 아이콘(512)

supabase/
└── migrations/
    └── 0001_init_public_job.sql      # Supabase 초기 스키마 + RLS 정책

middleware.ts                          # App Router 미들웨어(Supabase 세션 갱신)
```

## 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- 공공데이터포털 API 키 ([공공데이터포털](https://www.data.go.kr)에서 발급)

### 설치

```bash
# 저장소 클론
git clone https://github.com/gwangminjun/public_job.git
cd public-job-portal

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 키를 설정합니다 (`.env.example` 참고):

```env
DATA_GO_KR_API_KEY=your_api_key_here

NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_DEPLOY_DOMAIN
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
OPS_HEALTHCHECK_SECRET=YOUR_RANDOM_HEALTHCHECK_SECRET
```

### Supabase 적용 준비

1. Supabase SQL Editor에서 `supabase/migrations/0001_init_public_job.sql` 실행
2. Authentication > Providers에서 로그인 방식(Email OTP 또는 OAuth) 활성화
3. 프로젝트 환경변수에 위 3개 Supabase 키 등록
4. 앱 재시작 후 `middleware.ts`를 통해 세션 갱신 체인 동작 확인
5. (권장) `OPS_HEALTHCHECK_SECRET` 설정 후 `/api/ops/db-health` 모니터링 연동

생성되는 연동 골격 파일:

- `src/lib/supabase/client.ts` (브라우저 클라이언트)
- `src/lib/supabase/server.ts` (서버 컴포넌트/Route Handler 클라이언트)
- `src/lib/supabase/admin.ts` (서비스 롤 전용 클라이언트)
- `src/lib/supabase/middleware.ts` + `middleware.ts` (세션 갱신)
- `src/app/api/account/migrate-local/route.ts` (localStorage -> DB 1회 업로드)
- `src/app/api/ops/db-health/route.ts` (DB 헬스체크)

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 빌드

```bash
npm run build
npm start
```

## API 엔드포인트

### 채용공고 목록 조회

```
GET /api/jobs
```

**쿼리 파라미터:**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |
| keyword | string | - | 검색 키워드 |
| onlyOngoing | Y/N | - | 진행 중 공고만 필터링 |

### 채용공고 상세 조회

```
GET /api/jobs/[sn]
```

**경로 파라미터:**
| 파라미터 | 설명 |
|----------|------|
| sn | 공고 일련번호 (recrutPblntSn) |

### 검색어 자동완성 조회

```
GET /api/jobs/suggestions
```

**쿼리 파라미터:**
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| q | string | - | 자동완성 검색어 |
| limit | number | 8 | 최대 추천 개수 (1~20) |

## 필터 옵션

### 근무지역 (18개)

서울, 인천, 대전, 대구, 부산, 광주, 울산, 세종, 경기, 강원, 충남, 충북, 경북, 경남, 전남, 전북, 제주, 해외

### 고용형태 (7종)

정규직, 계약직, 무기계약직, 비정규직, 청년인턴, 청년인턴(체험형), 청년인턴(채용형)

### 채용구분 (4종)

신입, 경력, 신입+경력, 외국인 전형

### 직무분야 NCS (24종)

사업관리, 경영.회계.사무, 금융.보험, 교육.자연.사회과학, 법률.경찰.소방.교도.국방, 보건.의료, 사회복지.종교, 문화.예술.디자인.방송, 운전.운송, 영업판매, 경비.청소, 이용.숙박.여행.오락.스포츠, 음식서비스, 건설, 기계, 재료, 화학, 섬유.의복, 전기.전자, 정보통신, 식품가공, 인쇄.목재.가구.공예, 환경.에너지.안전, 농림어업, 연구

### 학력 (7종)

학력무관, 중졸이하, 고졸, 대졸(2~3년), 대졸(4년), 석사, 박사

## 배포

Vercel을 통한 배포가 권장됩니다. 자세한 내용은 [DEPLOY.md](./DEPLOY.md)를 참조하세요.

### 빠른 배포

1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 `DATA_GO_KR_API_KEY` 설정
3. 배포 완료

## 데이터 출처

- [공공데이터포털 - 한국산업인력공단\_공공기관 채용정보 API](https://www.data.go.kr)

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
npm run lighthouse:mobile   # 모바일 Lighthouse JSON 리포트 생성
npm run lighthouse:desktop  # 데스크탑 Lighthouse JSON 리포트 생성
npm run perf:audit          # 빌드 + 모바일/데스크탑 Lighthouse + 점수 요약
```

Lighthouse 리포트는 `.lighthouse/mobile.json`, `.lighthouse/desktop.json`에 저장됩니다.

## 라이선스

MIT License

## 현재 구현 완료 범위

- **1개월차(1~4주차)**: 서버 사이드 필터링/정렬, URL 상태 동기화, 관심 공고 저장, 공유 기능 및 안정화 완료
- **2개월차(5주차)**: 다크 모드(시스템 테마 연동 + 수동 토글) 완료
- **2개월차(6주차)**: 최근 본 공고(최대 10개 저장) 및 필터 프리셋(저장/불러오기/삭제) 완료
- **2개월차(7주차)**: 리스트/캘린더 전환형 채용 캘린더 뷰 + 기관별 모아보기 클릭 UX 개선 완료
- **2개월차(8주차)**: ICS 일정 내보내기 + 기관/직무 자동완성 검색 완료
- **2개월차(9주차 선반영)**: 지역별 지도 뷰(Leaflet/OpenStreetMap), 마커 클러스터링 처리 완료
- **지도 마커 개선**: D-day 기반 커스텀 핀(urgent/soon/normal/closed) + 선택 지역 강조 적용 완료
- **클러스터 디자인 개선**: 2중 링 + 공고 수 라벨 + 대형 클러스터 펄스 애니메이션 적용 완료
- **마커 아이콘 깨짐 수정**: `public/leaflet` 정적 자산 경로 고정으로 `marker-icon` 로딩 이슈 해결
- **2개월차(10주차 선반영)**: 채용 트렌드 대시보드(지역/채용구분/월별 추이) + 공고 비교 패널 완료
- **공고 비교 고도화**: 추천 3개 자동 선택 + 2~3개 공고 항목별 비교(기관/지역/자격요건/급여 힌트) 완료
- **캘린더 운영 개선**: 셀 간소화, 날짜별 상세 목록 패널, 오늘 복귀 버튼, 진행중 공고만 표시, 즐겨찾기 전용 캘린더 적용 완료
- **3개월차(11주차)**: PWA 오프라인 캐시 + i18next 다국어(ko/en) 전환 적용 완료
- **3개월차(12주차)**: 메인 뷰 지연 로딩(캘린더/지도/분석), 지도 데이터 조건부 fetch, 핵심 시나리오(필터→북마크→캘린더→지원) 점검 완료
- **4개월차(13주차)**: Supabase 스키마/RLS/미들웨어/환경변수 연동 준비 완료
- **4개월차(14주차)**: 이메일 로그인/회원가입 + 세션 연동 + 계정 정보(닉네임/언어/테마/타임존) 관리 페이지 구현 완료
- **4개월차(15주차)**: 북마크/최근본/필터 프리셋 DB 로드 + 자동 동기화 + localStorage 1회 마이그레이션 구현 완료
- **미구현(다음 일정)**: 16주차 기관 watch 알림 자동화

## 일정

# 🚀 채용 플랫폼 고도화 3개월 상세 로드맵

## 📅 개요

- **시작일:** 2026년 2월 16일 (월)
- **종료일:** 2026년 5월 10일 (일)
- **목표:** 데이터 신뢰도 확보, 개인화된 탐색 경험 제공 및 고급 시각화 구현

---

## 🏗️ 1개월차: 데이터 신뢰도 및 핵심 UX (2/16 ~ 3/15)

> **목표:** 검색 결과의 정확도를 높이고, 사용자가 찾은 정보를 잃어버리지 않게 합니다.

### 1주차: 필터링 정확도 개선 및 정렬 옵션 추가 (✅ 완료)

- **핵심 과제:** 클라이언트 필터링(100건 제한) → **서버 사이드 필터링** 전환
- **세부 내용:** \* `sort` 파라미터 구현 (마감일순, 등록일순, 채용인원순)
  - API Route(`src/app/api/jobs/route.ts`) 수정 및 데이터 정제 로직 강화
- **난이도:** 하~중

### 2주차: 상태 URL 동기화 (Quick Win!) (✅ 완료)

- **핵심 과제:** 필터/검색 상태와 브라우저 주소창 동기화
- **세부 내용:**
  - Zustand 스토어의 상태를 Query String으로 변환 및 복구 로직 구현
  - 새로고침/뒤로가기 시 검색 조건 유지 및 결과 페이지 링크 공유 활성화
- **난이도:** 중

### 3주차: 관심 공고(북마크) 저장 시스템 (✅ 완료)

- **핵심 과제:** 사용자만의 '찜' 목록 기능 구축
- **세부 내용:**
  - `localStorage` 기반 `bookmarkStore` 신설
  - `JobCard` 내 하트 아이콘 토글 버튼 및 북마크 전용 목록 페이지 구현
- **난이도:** 중

### 4주차: 공유 기능 및 1개월차 안정화 (✅ 완료)

- **핵심 과제:** 공고 확산 기능 및 통합 테스트
- **세부 내용:**
  - `navigator.share` API를 활용한 SNS 공유 및 URL 복사 기능
  - 1개월차 작업분 성능 최적화 및 버그 수정

---

## 🌙 2개월차: 탐색 경험 및 인터페이스 강화 (3/16 ~ 4/12)

> **목표:** 사용자가 공고를 더 쉽고 쾌적하게 탐색하도록 돕습니다.

### 5주차: 다크 모드 (Dark Mode) 구현 (✅ 완료)

- **핵심 과제:** 눈이 편안한 사용자 경험 제공
- **세부 내용:**
  - `next-themes` 적용 및 Tailwind CSS `dark:` 클래스 스타일링
  - 시스템 설정 연동 및 헤더 내 테마 전환 토글 추가
- **난이도:** 하

### 6주차: 최근 본 공고 및 필터 프리셋 (✅ 완료)

- **핵심 과제:** 탐색 이력 관리 및 검색 효율화
- **세부 내용:**
  - 최근 열람한 공고 ID 및 시간을 `localStorage`에 스택 형태로 저장 (최대 10개)
  - 자주 사용하는 필터 조합을 이름 붙여 저장하고 빠르게 불러오기
- **난이도:** 중

### 7주차: 채용 캘린더 뷰 (Calendar View) (✅ 완료)

- **핵심 과제:** 마감일 기준 공고 시각화
- **세부 내용:**
  - `date-fns` 라이브러리를 활용한 달력 레이아웃 구현
  - 리스트 형태와 달력 형태 간의 전환 토글 UI 추가
  - 캘린더 UI 간소화(날짜 셀 집계 중심), 날짜별 상세 목록 확인 패널, 오늘 복귀 버튼 추가
  - 캘린더는 진행중인 즐겨찾기 공고만 표시하도록 개선
- **난이도:** 중

### 8주차: 일정 내보내기(ICS) 및 자동완성 (✅ 완료)

- **핵심 과제:** 실제 지원 행동 유도 및 검색 편의성
- **세부 내용:**
  - 공고 마감일 정보를 외부 캘린더에 등록할 수 있는 ICS 파일 생성
  - 기관명 및 직무 키워드 기반의 실시간 검색어 자동완성 드롭다운
- **난이도:** 중

---

## 📊 3개월차: 고급 분석 및 서비스 완성 (4/13 ~ 5/10)

> **목표:** 플랫폼의 기술적 가치를 높이고 모바일/글로벌 사용성을 확보합니다.

### 9주차: 지역별 지도 뷰 (Map View) (✅ 선반영 완료)

- **핵심 과제:** 위치 기반 공고 탐색 및 시각화
- **세부 내용:**
  - Leaflet + OpenStreetMap 타일 연동
  - 지역별 공고 분포 마커 표시 및 클러스터링 처리
  - D-day 기반 커스텀 마커(긴급/임박/일반/마감) 스타일 적용
  - 클러스터 마커 디자인 개선(카운트 라벨, 크기별 색상, 펄스 효과)
  - Leaflet 기본 마커 아이콘 경로 고정(`public/leaflet`)
- **난이도:** 높음

### 10주차: 채용 트렌드 대시보드 및 공고 비교 (✅ 선반영 완료)

- **핵심 과제:** 데이터 인사이트 제공
- **세부 내용:**
  - 지역/채용구분/월별 공고 추이를 보여주는 통계 차트 제공
  - 2~3개 공고를 선택해 급여, 지역, 자격요건을 나란히 비교하는 기능
  - 추천 3개 자동 선택, 선택 초기화, 상세 보기 연결 지원
- **난이도:** 높음

### 11주차: PWA 지원 및 다국어 UI (✅ 완료)

- **핵심 과제:** 모바일 앱 환경 및 글로벌 확장성
- **세부 내용:**
  - Service Worker 설정을 통한 오프라인 캐싱 및 홈 화면 추가 지원
  - `i18next` 기반 다국어 UI 처리 (영어/한국어)
- **난이도:** 중

### 12주차: 최종 통합 테스트 및 배포 안정화 (✅ 완료)

- **핵심 과제:** 서비스 퀄리티 마감
- **세부 내용:**
  - Lighthouse 성능 측정 및 이미지/코드 스플리팅 최적화
  - 전체 사용자 시나리오(필터→북마크→캘린더→지원) 검증 및 최종 릴리즈

---

## 🔐 4개월차: 계정/영속 데이터 전환 (5/11 ~ 6/7)

> **목표:** 현재 `localStorage` 중심 개인화 기능을 로그인 사용자 기준 서버 DB(**Supabase PostgreSQL**)로 전환하고, 알림/운영 기반을 마련합니다.

### 13주차: Supabase 인프라 및 스키마 구축 (✅ 완료)

- **핵심 과제:** 운영 가능한 데이터 저장소 확정
- **세부 내용:**
  - Supabase 프로젝트(개발/스테이징/운영) 구성
  - `DATABASE_DESIGN.md` 기준 핵심 테이블 생성(users, sessions, bookmarks, presets, watches, dispatch_logs)
  - 마이그레이션 체계(예: SQL migration or ORM migration) 도입
- **난이도:** 높음

#### 13주차 착수 체크리스트 (Supabase)

- [x] Supabase 프로젝트 3개(dev/stg/prod) 생성 및 Region 확정
- [x] `DATABASE_DESIGN.md`의 PostgreSQL enum/extension(`pgcrypto`, `citext`) 적용 가능 여부 확인
- [x] Supabase SQL Editor로 초기 스키마 적용 스크립트 작성
- [x] RLS(Row Level Security) 기본 정책 설계 (`user_id = auth.uid()`) 및 테스트 테이블 1종 우선 적용
- [x] Auth 전략 확정 (Email OTP/Password/Social 중 1차 범위)
- [x] 환경변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [x] 로컬/CI 마이그레이션 실행 절차 문서화 (rollback 포함)
- [x] 초기 데이터 마이그레이션 계획 수립 (localStorage -> DB 1회 업로드 API)
- [x] 백업/복구 정책 및 운영 알림 설정 가이드 문서화 + DB 헬스체크 API 구현

### 14주차: 로그인/세션 및 사용자 관리 기본 기능 (✅ 완료)

- **핵심 과제:** 인증 기반 사용자 식별 도입
- **세부 내용:**
  - 이메일 로그인(또는 소셜 로그인) + 세션 관리 구현
  - 내 정보 기본 CRUD(닉네임, 언어, 테마, 타임존)
  - 권한/보안 기본 정책(비밀번호 해시, 세션 만료, 감사 로그) 적용
  - `/auth/login` 로그인/회원가입 UI, `/account` 계정 관리 페이지 추가
  - 헤더 로그인/로그아웃/계정 이동 동선 연동
- **난이도:** 높음

### 15주차: 기존 개인화 기능의 DB 영속화 전환 (✅ 완료)

- **핵심 과제:** 클라이언트 저장소 기능 서버 이관
- **세부 내용:**
  - 북마크/최근 본 공고/필터 프리셋을 사용자별 DB 저장으로 전환
  - 로그인 시 localStorage → DB 1회 마이그레이션 동선 구현
  - 다중 디바이스 동기화 및 충돌 정책(업서트/중복 제거) 반영
  - `/api/account/user-data` 전체 조회/동기화 API 추가
  - `UserDataSync`, `LocalToDbMigration`를 통한 DB 로드/자동 동기화 연결
- **난이도:** 높음

### 16주차: 기관 watch 일일 점검 + 메신저 알림 MVP

- **핵심 과제:** 사용자별 알림 자동화 파이프라인 완성
- **세부 내용:**
  - 특정 기관 watch 규칙 저장/관리 UI + API 구현
  - 일일 스케줄러(크론)로 신규 공고 점검 및 발송 큐 처리
  - 메신저 채널 1종 연동 + 중복 방지(idempotency key) + 옵트아웃 처리
- **난이도:** 매우 높음
