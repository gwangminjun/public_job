# 🌸 할머니 팔순잔치 기념 사이트

가족을 위한 팔순(80세) 생신 기념 미니 사이트입니다.  
공공정보 포털 프로젝트(`public_job`) 내 `/grandma` 경로로 운영됩니다.

- **배포 URL**: `https://public-job.vercel.app/grandma`
- **관리자 URL**: `https://public-job.vercel.app/grandma/admin`

---

## 📁 디렉터리 구조

```
src/
├── app/grandma/
│   ├── layout.tsx          # 공통 헤더·푸터 레이아웃
│   ├── page.tsx            # 메인 홈 (카운트다운, 잔치 안내, 메뉴)
│   ├── admin/page.tsx      # 사진 관리 (업로드·삭제)
│   ├── gallery/page.tsx    # 사진첩 (SSR, 60초 revalidate)
│   ├── guestbook/page.tsx  # 방명록
│   └── timeline/page.tsx   # 80년의 발자취 타임라인
└── components/grandma/
    ├── Countdown.tsx       # D-day 카운트다운 (클라이언트)
    ├── PhotoAdmin.tsx      # 사진 업로드·삭제 관리 폼
    ├── PhotoGallery.tsx    # 사진 그리드 + 라이트박스 + 연도 필터
    ├── GuestbookForm.tsx   # 방명록 작성 폼
    └── GuestbookList.tsx   # 방명록 목록
```

---

## ✅ 현재 구현 완료

### 공통
- 전용 레이아웃 (갈색 계열 헤더·푸터, 아이보리 배경)
- 상단 네비게이션 (홈 / 80년의 발자취 / 사진첩 / 방명록)
- 모바일 하단 탭 + 햄버거 메뉴 네비게이션

### 메인 페이지 (`/grandma`)
- 잔치 D-day 실시간 카운트다운 (일·시·분·초)
- 잔치 안내 카드 (일시 / 장소 / 주최)
- 페이지 메뉴 카드 (타임라인·사진첩·방명록 바로가기)
- 하단 사진 관리 버튼 (`/grandma/admin` 바로 이동)
- 메인 히어로 사진 자동 슬라이드
- 잔칫날 특별 배너 + 꽃가루 연출
- QR 코드 공유 카드

### 타임라인 (`/grandma/timeline`)
- 연도별 인생 이벤트 목록 (1946 탄생 → 2026 팔순)
- 팔순 이벤트 하이라이트 강조 스타일

### 사진첩 (`/grandma/gallery`)
- Supabase Storage에서 사진 로드 (SSR + 60초 revalidate)
- 연도 필터 버튼 (전체 / 연도별)
- 그리드 레이아웃 (모바일 2열 → 데스크탑 4열)
- 라이트박스 (클릭 시 원본 이미지 + 캡션 + 촬영 연도 표시)
- 브라우저 인쇄 버튼 + 인쇄용 그리드 레이아웃

### 방명록 (`/grandma/guestbook`)
- 이모지 선택 (8종) + 이름 + 메시지 입력
- Supabase DB 저장 및 실시간 목록 갱신
- 작성 시각 상대적 표시 (`date-fns` ko 로케일)
- 4자리 삭제 비밀번호로 본인 메시지 삭제

### 사진 관리 (`/grandma/admin`)
- 사진 파일 선택 + 미리보기
- 캡션(최대 50자) · 촬영 연도 입력
- Supabase Storage 업로드 → DB 메타 저장 원자적 처리
- 등록된 사진 목록 + 호버 시 삭제 버튼
- 잔치 정보 편집 (`grandma_config`)
- 타임라인 항목 CRUD (`grandma_timeline`)
- 사진 순서 드래그 앤 드롭 정렬 (`sort_order`)
- 다중 사진 업로드 및 진행률 표시
- 라이트박스에서 사진 설명·촬영 연도 수정
- 업로드 전 이미지 리사이즈 + WebP 변환
- 관리자 페이지는 공유 비밀번호 입력 후 접근 가능 (`GRANDMA_ADMIN_PASSWORD`)

### 영상 페이지 (`/grandma/video`)
- 축하 영상 전용 페이지
- 관리자에서 입력한 영상 URL 임베드 지원

### 2단계 UX 개선 완료 (2026-04-14)
- 사진첩 라이트박스에 이전/다음 이동, 키보드 방향키 이동, 공유 버튼 추가
- 방명록 작성 시 4자리 삭제 비밀번호를 함께 저장하고 본인 메시지 삭제 지원
- 사진 관리 페이지에서 다중 사진 업로드와 업로드 진행률 표시 지원
- 사진 관리 라이트박스에서 캡션/촬영 연도 수정 지원
- 모바일 전용 하단 탭 + 햄버거 메뉴로 작은 화면 네비게이션 개선

### 3단계 접근성 및 보안 완료 (2026-04-14)
- 관리자 페이지는 공유 비밀번호 방식으로 진입
- 방명록 작성 시 IP 기반 속도 제한 추가
- 방명록 작성 시 클라이언트/서버 욕설 필터 적용
- 사진 업로드 전 최대 1920px 리사이즈 및 WebP 변환 적용

### 4단계 특별 기능 완료 (2026-04-14)
- 메인 히어로 사진 자동 슬라이드 추가
- 잔칫날 특별 배너와 꽃가루 애니메이션 추가
- 축하 영상 전용 페이지 및 관리자 입력형 영상 URL 임베드 지원
- 사이트 QR 코드 생성 및 메인 페이지 표시
- 사진첩 인쇄 버튼과 인쇄 최적화 레이아웃 추가

### 1단계 구현 완료 (2026-04-14)
- `grandma_timeline` 테이블 기반으로 타임라인 페이지를 DB 연동으로 전환
- 관리자 페이지에서 타임라인 추가/수정/삭제 가능
- `grandma_config` 테이블 기반으로 메인 잔치 정보 및 카운트다운 기준값 관리 가능
- `grandma_photos.sort_order` 도입 및 관리자 페이지에서 사진 순서 저장 지원
- 관련 API 라우트 추가: 설정 저장, 타임라인 CRUD, 사진 업로드/삭제/재정렬

---

## 🗄️ Supabase 설정

### 스토리지 버킷

| 버킷 이름 | 공개 여부 |
|-----------|-----------|
| `grandma-photos` | Public |

### 테이블 스키마

```sql
-- 사진 메타데이터
create table grandma_photos (
  id          uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption     text,
  taken_year  int,
  created_at  timestamptz default now()
);

-- 방명록
create table grandma_guestbook (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  message    text not null,
  emoji      text not null default '❤️',
  created_at timestamptz default now()
);
```

### RLS 정책

```sql
alter table grandma_photos enable row level security;
alter table grandma_guestbook enable row level security;

-- grandma_photos
create policy "gp_select" on grandma_photos for select to anon, authenticated using (true);
create policy "gp_insert" on grandma_photos for insert to anon, authenticated with check (true);
create policy "gp_delete" on grandma_photos for delete to anon, authenticated using (true);

-- grandma_guestbook
create policy "gg_select" on grandma_guestbook for select to anon, authenticated using (true);
create policy "gg_insert" on grandma_guestbook for insert to anon, authenticated with check (true);

-- Storage 버킷 정책
create policy "gs_insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'grandma-photos');
create policy "gs_delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'grandma-photos');
```

---

## 🐛 버그 수정 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-14 | `focusRingColor` — CSS inline style 미지원 속성 제거 |
| 2026-04-14 | `Bucket not found` — Supabase Storage 버킷 미생성 안내 및 RLS 정책 가이드 추가 |
| 2026-04-14 | `new row violates row-level security` — `grandma_photos` INSERT 정책 누락 수정 |
| 2026-04-14 | `400 Bad Request (Next.js Image)` — `next.config.ts`에 `*.supabase.co` remotePatterns 등록 |
| 2026-04-14 | 업로드 에러 메시지 — Supabase 오류 객체 타입 분기로 실제 원인 표출 |
| 2026-04-14 | 입력창 글자 안 보임 — 모든 input·select·textarea에 `color` / `backgroundColor` 명시 |
| 2026-04-14 | 1단계 콘텐츠 완성 기능 구현 — 타임라인 DB 관리, 잔치 정보 DB 관리, 사진 순서 정렬 추가 |
| 2026-04-14 | 2단계 UX 개선 구현 — 슬라이드 라이트박스, 방명록 비밀번호 삭제, 다중 업로드, 모바일 네비게이션 |
| 2026-04-14 | 3단계 보안 구현 — 관리자 로그인 보호, 방명록 rate limit, 욕설 필터, 이미지 최적화 |
| 2026-04-14 | 4단계 특별 기능 구현 — 영상 페이지, 메인 슬라이드, 잔칫날 모드, QR 공유, 인쇄 레이아웃 |

---

## 🚀 추가 기능 및 개선 설계

### 1단계 — 콘텐츠 완성

#### 1-1. 타임라인 직접 관리 (완료)
- **현재**: 타임라인 데이터가 코드에 하드코딩
- **개선**: Supabase `grandma_timeline` 테이블로 이관 + 관리자 페이지에서 CRUD
- **테이블**:
  ```sql
  create table grandma_timeline (
    id          uuid primary key default gen_random_uuid(),
    year        int not null,
    title       text not null,
    description text,
    emoji       text,
    highlight   boolean default false,
    sort_order  int default 0
  );
  ```

#### 1-2. 잔치 정보 관리자 편집 (완료)
- **현재**: 날짜·장소·주최 정보가 코드에 고정
- **개선**: Supabase `grandma_config` 테이블로 분리, 관리자 페이지에서 수정 가능
- **필드**: `event_date`, `event_time`, `location`, `location_detail`, `host`

#### 1-3. 사진 순서 정렬 (완료)
- **현재**: `created_at` 내림차순 고정
- **개선**: 관리자 드래그 앤 드롭으로 순서 지정 (`sort_order` 컬럼 추가)

---

### 2단계 — UX 개선

#### 2-1. 사진첩 슬라이드쇼 (완료)
- 라이트박스에 이전/다음 화살표 버튼 추가
- 키보드 방향키 네비게이션 지원

#### 2-2. 방명록 삭제 기능 (완료)
- 비밀번호(4자리 숫자) 입력 후 본인 메시지 삭제
- 또는 관리자 페이지에서 방명록 목록 관리

#### 2-3. 사진 업로드 다중 선택 (완료)
- **현재**: 파일 1장씩 업로드
- **개선**: 한 번에 여러 장 선택 후 일괄 업로드, 진행률 표시

#### 2-4. 모바일 반응형 네비게이션 (완료)
- **현재**: 좁은 화면에서 메뉴 텍스트 잘림
- **개선**: 햄버거 메뉴 또는 하단 탭 바로 전환

#### 2-5. 사진 캡션 라이트박스 개선 (완료)
- 라이트박스에서 캡션 수정 기능 (관리자만)
- 사진 공유 버튼 (네이티브 Share API)

---

### 3단계 — 접근성 및 보안

#### 3-1. 관리자 인증 (완료)
- `/grandma/admin`에서 공유 비밀번호를 입력하면 쿠키 세션으로 관리 기능 사용
- `GRANDMA_ADMIN_PASSWORD` 환경변수로 비밀번호 설정

#### 3-2. 방명록 스팸 방지 (완료)
- 동일 IP 단시간 다수 작성 제한
- 클라이언트/서버 욕설 필터링 적용

#### 3-3. 이미지 최적화 (완료)
- 업로드 시 클라이언트에서 리사이즈 (`canvas` API, 최대 1920px)
- WebP 변환 후 업로드로 용량 절감

---

### 4단계 — 특별 기능

#### 4-1. 축하 영상 섹션 (완료)
- 유튜브/Vimeo 임베드 또는 Supabase Storage에 동영상 업로드
- 메인 또는 별도 `/grandma/video` 페이지

#### 4-2. 포토 슬라이드 자동 재생 (완료)
- 메인 히어로 영역에 사진 자동 슬라이드 (5초 간격)
- 아이보리 계열 페이드 트랜지션

#### 4-3. 잔치 당일 특별 모드 (완료)
- 잔치 날짜(2026-04-25) 자동 감지
- 특별 배너·축하 메시지·꽃가루 애니메이션 표시

#### 4-4. QR코드 공유 (완료)
- 사이트 URL QR코드 생성 버튼 (잔치 당일 인쇄 배포용)
- `qrcode` npm 패키지 활용

#### 4-5. 인쇄용 사진첩 레이아웃 (완료)
- `@media print` CSS로 그리드 최적화
- 브라우저 인쇄 기능으로 PDF 저장 지원

---

## 📅 개발 우선순위

| 순위 | 기능 | 난이도 | 효과 |
|------|------|--------|------|
| ⭐⭐⭐ | 사진 다중 업로드 (2-3) | 중 | 편의성 크게 향상 |
| ⭐⭐⭐ | 잔치 당일 특별 모드 (4-3) | 중 | 감동 포인트 |
| ⭐⭐ | 라이트박스 슬라이드 (2-1) | 하 | UX 자연스러움 |
| ⭐⭐ | 방명록 삭제 (2-2) | 하 | 운영 편의 |
| ⭐⭐ | 타임라인 DB 이관 (1-1) | 중 | 콘텐츠 관리 유연성 |
| ⭐ | QR코드 공유 (4-4) | 하 | 현장 활용 |
| ⭐ | 이미지 최적화 (3-3) | 중 | 비용/속도 |
| ⭐ | 인쇄용 레이아웃 (4-5) | 하 | 기념품 활용 |

---

## 🎨 디자인 토큰

| 용도 | 색상 코드 |
|------|-----------|
| 주요 텍스트 | `#5C3317` |
| 보조 텍스트 | `#7B4F2E` |
| 힌트 텍스트 | `#A07850` |
| 입력 테두리 | `#C49A6C` |
| 입력 글자 | `#3B1F0E` |
| 입력 배경 | `#FFFDF7` |
| 카드 배경 | `#FFFAF3` |
| 카드 테두리 | `#E8C99A` |
| 페이지 배경 | `#FFF8EE` |
| 헤더·버튼 | `#7B4F2E` |
