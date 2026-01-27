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
│   │       └── [sn]/route.ts         # GET /api/jobs/[sn] - 채용공고 상세
│   ├── jobs/
│   │   └── [sn]/page.tsx             # 채용공고 상세 페이지
│   ├── layout.tsx                    # 루트 레이아웃
│   ├── page.tsx                      # 메인 페이지
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # 헤더
│   │   ├── Footer.tsx                # 푸터
│   │   └── SearchFilter.tsx          # 검색 및 필터
│   ├── jobs/
│   │   ├── JobCard.tsx               # 채용공고 카드
│   │   ├── JobList.tsx               # 채용공고 목록
│   │   └── JobModal.tsx              # 채용공고 모달
│   ├── stats/
│   │   └── StatsPanel.tsx            # 통계 패널
│   ├── ui/
│   │   ├── Badge.tsx                 # 뱃지
│   │   ├── Pagination.tsx            # 페이지네이션
│   │   └── Skeleton.tsx              # 스켈레톤 로딩
│   └── Providers.tsx                 # React Query 프로바이더
├── hooks/
│   ├── useJobs.ts                    # 채용공고 목록 fetch
│   └── useJobDetail.ts               # 채용공고 상세 fetch
├── store/
│   └── filterStore.ts                # Zustand 필터 상태 관리
└── lib/
    ├── types.ts                      # TypeScript 타입 정의
    └── utils.ts                      # 유틸리티 함수 및 상수
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

`.env.local` 파일을 생성하고 API 키를 설정합니다:

```env
DATA_GO_KR_API_KEY=your_api_key_here
```

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

- [공공데이터포털 - 한국산업인력공단_공공기관 채용정보 API](https://www.data.go.kr)

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## 라이선스

MIT License
