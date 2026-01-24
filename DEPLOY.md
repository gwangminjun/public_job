# Vercel 배포 가이드

공공기관 채용정보 사이트를 Vercel에 배포하는 방법을 안내합니다.

---

## 목차

1. [사전 준비](#1-사전-준비)
2. [GitHub 저장소 연결 (권장)](#2-github-저장소-연결-권장)
3. [Vercel CLI로 배포](#3-vercel-cli로-배포)
4. [환경변수 설정](#4-환경변수-설정)
5. [배포 확인](#5-배포-확인)
6. [커스텀 도메인 연결](#6-커스텀-도메인-연결)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비

### 필수 요구사항

- [Node.js](https://nodejs.org/) 18.x 이상
- [Git](https://git-scm.com/) 설치
- [Vercel 계정](https://vercel.com/signup) (GitHub/GitLab/Email로 가입 가능)
- 공공데이터포털 API 키 (이미 발급됨)

### 프로젝트 빌드 테스트

배포 전 로컬에서 빌드가 정상적으로 되는지 확인합니다.

```bash
cd public-job-portal
npm run build
```

빌드 성공 시 아래와 같은 메시지가 표시됩니다:

```
✓ Compiled successfully
✓ Generating static pages
```

---

## 2. GitHub 저장소 연결 (권장)

GitHub을 통한 배포가 가장 권장되는 방법입니다. 코드 push 시 자동 배포됩니다.

### Step 1: GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단 `+` → `New repository` 클릭
3. Repository name: `public-job-portal` 입력
4. `Create repository` 클릭

### Step 2: 코드 Push

```bash
cd public-job-portal

# Git 초기화 (이미 되어있다면 생략)
git init

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/public-job-portal.git

# 커밋 및 푸시
git add .
git commit -m "Initial commit: 공공기관 채용정보 사이트"
git branch -M main
git push -u origin main
```

### Step 3: Vercel에서 Import

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. `Add New...` → `Project` 클릭
3. `Import Git Repository` 섹션에서 GitHub 연결
4. `public-job-portal` 저장소 선택 → `Import` 클릭

### Step 4: 프로젝트 설정

| 설정 항목 | 값 |
|----------|-----|
| Framework Preset | Next.js (자동 감지) |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

5. `Environment Variables` 섹션에서 환경변수 추가 (아래 4번 참조)
6. `Deploy` 클릭

---

## 3. Vercel CLI로 배포

CLI를 통한 직접 배포 방법입니다.

### Step 1: Vercel CLI 설치

```bash
npm install -g vercel
```

### Step 2: Vercel 로그인

```bash
vercel login
```

브라우저가 열리면 로그인을 완료합니다.

### Step 3: 프로젝트 배포

```bash
cd public-job-portal

# 프리뷰 배포 (테스트용)
vercel

# 프로덕션 배포
vercel --prod
```

첫 배포 시 아래 질문에 답변합니다:

```
? Set up and deploy? Yes
? Which scope? (계정 선택)
? Link to existing project? No
? What's your project's name? public-job-portal
? In which directory is your code located? ./
```

### Step 4: 환경변수 설정 (CLI)

```bash
# 환경변수 추가
vercel env add DATA_GO_KR_API_KEY

# 값 입력 프롬프트가 나타나면 API 키 입력
# 환경 선택: Production, Preview, Development 모두 선택
```

### Step 5: 재배포

환경변수 추가 후 재배포가 필요합니다.

```bash
vercel --prod
```

---

## 4. 환경변수 설정

### Vercel 대시보드에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 프로젝트 선택
2. `Settings` 탭 클릭
3. 좌측 메뉴에서 `Environment Variables` 클릭
4. 아래 변수 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `DATA_GO_KR_API_KEY` | `HvFGWMzzjE...` (전체 키) | Production, Preview, Development |

5. `Save` 클릭

### 환경변수 추가 후

환경변수 변경 시 재배포가 필요합니다:

- **GitHub 연결**: 새 커밋 push 또는 대시보드에서 `Redeploy`
- **CLI 배포**: `vercel --prod` 재실행

---

## 5. 배포 확인

### 배포 URL 확인

배포 완료 후 아래 형식의 URL이 제공됩니다:

```
https://public-job-portal.vercel.app
https://public-job-portal-[hash].vercel.app
```

### 체크리스트

- [ ] 메인 페이지 로딩 확인
- [ ] 채용공고 목록 표시 확인
- [ ] 검색 기능 작동 확인
- [ ] 상세 모달 열기 확인
- [ ] 상세 페이지 접근 확인

### 로그 확인

문제 발생 시 Vercel 대시보드에서 로그를 확인합니다:

1. 프로젝트 선택
2. `Deployments` 탭
3. 해당 배포 클릭
4. `Functions` 또는 `Logs` 탭에서 에러 확인

---

## 6. 커스텀 도메인 연결

### Step 1: 도메인 추가

1. Vercel 대시보드 → 프로젝트 → `Settings`
2. `Domains` 섹션
3. 도메인 입력 (예: `public-job.example.com`)
4. `Add` 클릭

### Step 2: DNS 설정

도메인 등록 업체(가비아, 카페24 등)에서 DNS 레코드 추가:

**서브도메인 사용 시 (권장)**
```
Type: CNAME
Name: public-job (또는 www)
Value: cname.vercel-dns.com
```

**루트 도메인 사용 시**
```
Type: A
Name: @
Value: 76.76.19.19
```

### Step 3: SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다.
DNS 설정 후 수 분 내에 HTTPS가 활성화됩니다.

---

## 7. 문제 해결

### API 데이터가 로드되지 않는 경우

**원인**: 환경변수 미설정 또는 잘못된 API 키

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. `DATA_GO_KR_API_KEY` 값이 정확한지 확인
3. 재배포 실행

### 빌드 실패

**원인**: 의존성 또는 타입 에러

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 메시지 확인 후 수정
```

### 504 Gateway Timeout

**원인**: API 응답 시간 초과

**해결**:
- 공공데이터포털 API 상태 확인
- `vercel.json`에서 함수 타임아웃 조정:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### CORS 에러

**원인**: 클라이언트에서 직접 외부 API 호출

**해결**:
- 본 프로젝트는 Next.js API Route를 통해 프록시하므로 CORS 문제 없음
- 클라이언트 코드에서 `/api/jobs` 엔드포인트 사용 확인

---

## 추가 설정

### 자동 재배포 스케줄 (Cron)

`vercel.json`에 이미 설정되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

> 6시간마다 캐시를 갱신합니다. (Vercel Pro 플랜 필요)

### 분석 및 모니터링

1. Vercel 대시보드 → `Analytics` 탭
2. Web Vitals, 방문자 통계 확인 가능
3. Pro 플랜에서 상세 분석 제공

---

## 유용한 링크

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [공공데이터포털](https://www.data.go.kr)
- [프로젝트 GitHub](https://github.com/YOUR_USERNAME/public-job-portal)

---

## 지원

배포 관련 문의사항이 있으시면 이슈를 등록해주세요.
