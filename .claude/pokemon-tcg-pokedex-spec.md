# Pokemon TCG 도감 앱 — 개발 명세서

> Claude Code 하네스 엔지니어링 기반 개발용 문서  
> API: [Pokemon TCG API v2](https://pokemontcg.io/) | Base URL: `https://api.pokemontcg.io/v2`

---

## 1. 프로젝트 개요

### 목적
Pokemon TCG API를 활용해 카드 세트(상자)별 수록 카드 목록, 희귀도(등급), TCGPlayer 시세를 조회할 수 있는 웹 기반 도감 앱을 개발한다.

### 핵심 기능 요약
| 기능 | 설명 |
|------|------|
| 세트 목록 조회 | 전체 카드 세트를 시리즈별로 탐색 |
| 세트 내 카드 목록 | 선택한 세트의 카드 전체 조회 (희귀도 필터) |
| 카드 상세 | 카드 이미지, 능력치, 희귀도, TCGPlayer 시세 |
| 카드 검색 | 이름/타입/희귀도 등 조건 복합 검색 |

---

## 2. 기술 스택

```
Frontend : Next.js 16 (App Router) + TypeScript
Styling  : Tailwind CSS v4 (CSS-first, tailwind.config.ts 없음)
State    : Zustand v5 (클라이언트 로컬) + TanStack Query v5 (서버 상태/캐시)
Backend  : Next.js API Routes (프록시 — CORS 및 API Key 보호)
배포     : Vercel
```

> **Next.js 16 주의**: 동적 라우트 세그먼트 파라미터가 `Promise<{ id: string }>` 타입이므로  
> Route Handler에서 반드시 `const { id } = await params;` 형태로 await 해야 한다.

> **CORS 주의**: 브라우저에서 `api.pokemontcg.io`로 직접 요청 시 CORS 차단됨.  
> 반드시 Next.js API Routes를 프록시로 사용하고, API Key는 서버 사이드에서만 주입.

---

## 3. 환경 변수

`.env.local` 파일에 아래 항목을 설정한다.

```env
POKEMON_TCG_API_KEY=발급받은_API_키
POKEMON_TCG_BASE_URL=https://api.pokemontcg.io/v2
```

클라이언트에 절대 노출하지 않는다. `NEXT_PUBLIC_` 접두사 사용 금지.

---

## 4. 디렉토리 구조

현재 레포(`public_job`)의 컨벤션을 따른다.

```
src/
├── app/
│   ├── layout.tsx                        # 루트 레이아웃 (Providers 포함)
│   ├── globals.css                        # Tailwind v4 @import
│   ├── page.tsx                          # 홈 → /sets 리다이렉트
│   ├── sets/
│   │   ├── page.tsx                      # 세트 목록
│   │   └── [setId]/
│   │       └── page.tsx                  # 세트 상세 (카드 목록)
│   ├── cards/
│   │   └── [cardId]/
│   │       └── page.tsx                  # 카드 상세
│   ├── search/
│   │   └── page.tsx                      # 카드 검색
│   └── api/
│       ├── sets/
│       │   ├── route.ts                  # GET /api/sets
│       │   └── [setId]/
│       │       └── route.ts             # GET /api/sets/:setId
│       └── cards/
│           ├── route.ts                  # GET /api/cards
│           └── [cardId]/
│               └── route.ts             # GET /api/cards/:cardId
│
├── components/
│   ├── sets/
│   │   ├── SetGrid.tsx                   # 세트 카드 그리드
│   │   └── SetCard.tsx                   # 세트 카드 단위
│   ├── cards/
│   │   ├── CardGrid.tsx                  # 카드 그리드
│   │   ├── CardItem.tsx                  # 카드 썸네일 아이템
│   │   └── CardDetail.tsx                # 카드 상세 패널
│   ├── search/
│   │   ├── SearchBar.tsx                 # 검색 입력
│   │   └── CardFilterPanel.tsx           # 희귀도/타입/서브타입 필터
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── Pagination.tsx                # 공통 페이지네이션
│       └── Skeleton.tsx                  # 로딩 스켈레톤
│
├── hooks/
│   ├── useSets.ts                        # TanStack Query — 세트 목록/단건
│   └── useCards.ts                       # TanStack Query — 카드 목록/단건
│
├── store/
│   └── cardFilterStore.ts                # Zustand — 검색 필터 상태
│
└── lib/
    ├── types.ts                          # PokemonSet, PokemonCard 등 타입
    └── pokemon-api.ts                    # 내부 프록시 fetch 함수
```

---

## 5. TypeScript 타입 정의

`src/lib/types.ts`

```typescript
// 세트 객체
export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
  legalities: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
}

// 카드 객체
export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;           // "Pokémon" | "Trainer" | "Energy"
  subtypes: string[];          // ["Basic", "EX", "VMAX", ...]
  hp?: string;
  types?: string[];            // ["Fire", "Water", ...]
  evolvesFrom?: string;
  rarity?: string;
  number: string;
  artist?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  set: PokemonSet;
  images: {
    small: string;
    large: string;
  };
  legalities: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices: {
      normal?: PriceDetail;
      holofoil?: PriceDetail;
      reverseHolofoil?: PriceDetail;
      '1stEditionHolofoil'?: PriceDetail;
      '1stEditionNormal'?: PriceDetail;
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
    };
  };
}

export interface PriceDetail {
  low: number;
  mid: number;
  high: number;
  market: number;
  directLow?: number;
}

// API 응답 래퍼
export interface ApiListResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface ApiSingleResponse<T> {
  data: T;
}

// 카드 검색 파라미터
export interface CardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

// 세트 검색 파라미터
export interface SetSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}
```

---

## 6. 프록시 API Routes 구현

### 6-1. 세트 목록 — `src/app/api/sets/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.POKEMON_TCG_BASE_URL!;
const API_KEY = process.env.POKEMON_TCG_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params = new URLSearchParams();

  const q = searchParams.get('q');
  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '20';
  const orderBy = searchParams.get('orderBy') ?? '-releaseDate';

  if (q) params.set('q', q);
  params.set('page', page);
  params.set('pageSize', pageSize);
  params.set('orderBy', orderBy);

  const res = await fetch(`${BASE}/sets?${params}`, {
    headers: { 'X-Api-Key': API_KEY },
    next: { revalidate: 3600 }, // 1시간 캐시
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch sets' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
```

### 6-2. 세트 단건 — `src/app/api/sets/[setId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.POKEMON_TCG_BASE_URL!;
const API_KEY = process.env.POKEMON_TCG_API_KEY!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const { setId } = await params;

  const res = await fetch(`${BASE}/sets/${setId}`, {
    headers: { 'X-Api-Key': API_KEY },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Set not found' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
```

### 6-3. 카드 목록/검색 — `src/app/api/cards/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.POKEMON_TCG_BASE_URL!;
const API_KEY = process.env.POKEMON_TCG_API_KEY!;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params = new URLSearchParams();

  const q = searchParams.get('q');
  const page = searchParams.get('page') ?? '1';
  const pageSize = searchParams.get('pageSize') ?? '20';
  const orderBy = searchParams.get('orderBy') ?? 'number';

  if (q) params.set('q', q);
  params.set('page', page);
  params.set('pageSize', pageSize);
  params.set('orderBy', orderBy);

  const res = await fetch(`${BASE}/cards?${params}`, {
    headers: { 'X-Api-Key': API_KEY },
    next: { revalidate: 600 }, // 10분 캐시
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
```

### 6-4. 카드 단건 — `src/app/api/cards/[cardId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.POKEMON_TCG_BASE_URL!;
const API_KEY = process.env.POKEMON_TCG_API_KEY!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;

  const res = await fetch(`${BASE}/cards/${cardId}`, {
    headers: { 'X-Api-Key': API_KEY },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Card not found' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
```

---

## 7. API 클라이언트 함수

`src/lib/pokemon-api.ts`

```typescript
import type {
  PokemonSet, PokemonCard,
  ApiListResponse, ApiSingleResponse,
  CardSearchParams, SetSearchParams,
} from './types';

const BASE = '/api'; // 내부 프록시 경유

// ── Sets ──────────────────────────────────────────

export async function fetchSets(
  params: SetSearchParams = {}
): Promise<ApiListResponse<PokemonSet>> {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.orderBy) p.set('orderBy', params.orderBy);

  const res = await fetch(`${BASE}/sets?${p}`);
  if (!res.ok) throw new Error('세트 목록 조회 실패');
  return res.json();
}

export async function fetchSet(
  setId: string
): Promise<ApiSingleResponse<PokemonSet>> {
  const res = await fetch(`${BASE}/sets/${setId}`);
  if (!res.ok) throw new Error(`세트 조회 실패: ${setId}`);
  return res.json();
}

// ── Cards ─────────────────────────────────────────

export async function fetchCards(
  params: CardSearchParams = {}
): Promise<ApiListResponse<PokemonCard>> {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.orderBy) p.set('orderBy', params.orderBy);

  const res = await fetch(`${BASE}/cards?${p}`);
  if (!res.ok) throw new Error('카드 목록 조회 실패');
  return res.json();
}

export async function fetchCardsBySet(
  setId: string,
  params: Omit<CardSearchParams, 'q'> & { rarity?: string } = {}
): Promise<ApiListResponse<PokemonCard>> {
  let q = `set.id:${setId}`;
  if (params.rarity) q += ` rarity:"${params.rarity}"`;

  return fetchCards({
    q,
    page: params.page,
    pageSize: params.pageSize ?? 50,
    orderBy: params.orderBy ?? 'number',
  });
}

export async function fetchCard(
  cardId: string
): Promise<ApiSingleResponse<PokemonCard>> {
  const res = await fetch(`${BASE}/cards/${cardId}`);
  if (!res.ok) throw new Error(`카드 조회 실패: ${cardId}`);
  return res.json();
}
```

---

## 8. 검색 쿼리 문법

Pokemon TCG API는 Lucene 유사 쿼리를 `q` 파라미터로 받는다. 주요 패턴은 아래와 같다.

| 목적 | 쿼리 예시 |
|------|-----------|
| 세트 내 전체 카드 | `set.id:sv1` |
| 세트 내 희귀도 필터 | `set.id:sv1 rarity:"Rare Holo"` |
| 이름 검색 | `name:pikachu` |
| 이름 완전 일치 | `!name:Pikachu` |
| 이름 부분 일치 | `name:char*` |
| 타입 필터 | `types:fire` |
| 서브타입 필터 | `subtypes:vmax` |
| HP 범위 | `hp:[200 TO *]` |
| 도감번호 범위 | `nationalPokedexNumbers:[1 TO 151]` |
| 복합 조건 | `name:charizard subtypes:vmax set.id:swsh4` |
| OR 조건 | `subtypes:ex OR subtypes:vmax` |
| 제외 조건 | `subtypes:mega -types:water` |

### 주요 희귀도(Rarity) 값

```
Common
Uncommon
Rare
Rare Holo
Rare Holo EX
Rare Holo GX
Rare Holo V
Rare Holo VMAX
Rare Ultra
Rare Secret
Rare Rainbow
Rare Shining
Rare Shiny
Rare Shiny GX
Amazing Rare
LEGEND
Promo
```

> `/v2/rarities` 엔드포인트로 전체 목록 조회 가능.

---

## 9. 화면별 구현 명세

### 9-1. 홈 (세트 목록) — `/`

**역할**: 전체 카드 세트를 시리즈별 그룹으로 표시

**데이터 요청**
```
GET /api/sets?orderBy=-releaseDate&pageSize=50
```

**UI 구성**
- 상단: 시리즈 필터 탭 (Scarlet & Violet / Sword & Shield / Sun & Moon / XY / 전체)
- 본문: 세트 카드 그리드 (로고 이미지 + 세트명 + 시리즈 + 카드 수 + 출시일)
- 각 세트 클릭 시 `/sets/[setId]`로 이동

**표시 필드**
```
set.images.logo     — 세트 로고
set.name            — 세트명
set.series          — 시리즈명
set.total           — 총 카드 수
set.releaseDate     — 출시일
```

---

### 9-2. 세트 상세 (카드 목록) — `/sets/[setId]`

**역할**: 선택한 세트의 수록 카드 전체 표시 + 희귀도 필터

**데이터 요청**
```
GET /api/cards?q=set.id:{setId}&orderBy=number&pageSize=50&page={page}
GET /api/cards?q=set.id:{setId} rarity:"{rarity}"&orderBy=number&pageSize=50
```

**UI 구성**
- 상단: 세트 정보 헤더 (로고, 이름, 시리즈, 카드 수, 출시일)
- 희귀도 필터 버튼 (세트 내 존재하는 희귀도만 표시)
- 카드 그리드 (카드 이미지 + 이름 + 카드 번호 + 희귀도)
- 하단: 페이지네이션

**표시 필드**
```
card.images.small   — 카드 썸네일
card.name           — 카드 이름
card.number         — 카드 번호
card.rarity         — 희귀도
card.types          — 타입 (색상 배지)
card.tcgplayer.prices — 시세 (market 가격, 있을 경우)
```

---

### 9-3. 카드 상세 — `/cards/[cardId]`

**역할**: 카드 개별 상세 정보 + 시세 표시

**데이터 요청**
```
GET /api/cards/{cardId}
```

**UI 구성**
- 좌측: 카드 고해상도 이미지 (`images.large`)
- 우측: 카드 정보 패널

**표시 필드**

기본 정보:
```
card.name              — 이름
card.supertype         — 슈퍼타입
card.subtypes          — 서브타입
card.hp                — HP
card.types             — 에너지 타입
card.evolvesFrom       — 진화 전
card.rarity            — 희귀도
card.number            — 카드 번호
card.artist            — 일러스트레이터
card.flavorText        — 플레이버 텍스트
card.set.name          — 수록 세트
card.set.releaseDate   — 출시일
```

능력/기술:
```
card.abilities[]       — 특성 (name, text, type)
card.attacks[]         — 기술 (name, cost, damage, text)
card.weaknesses[]      — 약점
card.resistances[]     — 저항
card.retreatCost       — 도주 에너지
```

시세 (TCGPlayer, USD):
```
tcgplayer.prices.normal.market
tcgplayer.prices.holofoil.market
tcgplayer.prices.reverseHolofoil.market
tcgplayer.updatedAt
```

시세 (CardMarket, EUR):
```
cardmarket.prices.averageSellPrice
cardmarket.prices.trendPrice
cardmarket.prices.avg7
cardmarket.prices.avg30
cardmarket.updatedAt
```

---

### 9-4. 카드 검색 — `/search`

**역할**: 조건 복합 검색

**데이터 요청**
```
GET /api/cards?q={query}&page={page}&pageSize=20&orderBy={orderBy}
```

**검색 조건 UI**
| 조건 | 입력 방식 | 쿼리 변환 |
|------|-----------|-----------|
| 카드 이름 | 텍스트 입력 | `name:{입력값}*` |
| 타입 | 멀티셀렉트 | `types:{type}` |
| 서브타입 | 멀티셀렉트 | `subtypes:{subtype}` |
| 희귀도 | 셀렉트박스 | `rarity:"{rarity}"` |
| HP 범위 | 숫자 범위 | `hp:[{min} TO {max}]` |
| 세트 시리즈 | 셀렉트박스 | `set.series:"{series}"` |
| 정렬 | 셀렉트박스 | `orderBy` 파라미터 |

---

## 10. 데이터 캐싱 전략

| 데이터 | 캐시 TTL | 이유 |
|--------|----------|------|
| 세트 목록 | 1시간 | 신규 세트 출시 빈도 낮음 |
| 세트 단건 | 1시간 | 변경 거의 없음 |
| 카드 목록 | 10분 | 시세 업데이트 반영 |
| 카드 단건 | 10분 | 시세 업데이트 반영 |
| 희귀도/타입 메타 | 24시간 | 거의 변경 없음 |

Next.js `fetch`의 `next: { revalidate: N }` 옵션으로 ISR 방식 적용.  
TanStack Query는 클라이언트 사이드 `staleTime`을 동일한 TTL로 맞춰 중복 요청 방지.

---

## 11. Rate Limit 안내

| 구분 | 제한 |
|------|------|
| API Key 없음 | 1,000 req/day |
| API Key 있음 | 20,000 req/day |

- 응답 헤더 `X-RateLimit-Remaining`으로 잔여 횟수 확인 가능
- 429 응답 시 `Retry-After` 헤더 참조

---

## 12. 에러 처리 기준

| HTTP 상태 | 의미 | 처리 방법 |
|-----------|------|-----------|
| 200 | 성공 | 정상 처리 |
| 400 | 잘못된 쿼리 | 검색 조건 안내 메시지 표시 |
| 401 | API Key 누락/만료 | 환경변수 확인 안내 |
| 404 | 카드/세트 없음 | Not Found 페이지 |
| 429 | Rate Limit 초과 | 재시도 안내 + 남은 시간 표시 |
| 500 | 서버 에러 | 일반 에러 메시지 표시 |

---

## 13. 개발 순서 (Claude Code 작업 흐름)

```
Phase 1 — 프로젝트 초기 설정
  1. Next.js 16 프로젝트 생성 (TypeScript + Tailwind v4)
  2. 의존성 설치 (TanStack Query v5, Zustand v5)
  3. .env.local 설정
  4. src/lib/types.ts 작성

Phase 2 — 프록시 API Routes 구현
  5. /api/sets/route.ts
  6. /api/sets/[setId]/route.ts
  7. /api/cards/route.ts
  8. /api/cards/[cardId]/route.ts

Phase 3 — API 클라이언트 함수
  9. src/lib/pokemon-api.ts 작성

Phase 4 — 공통 컴포넌트
  10. LoadingSpinner, Pagination, ErrorMessage

Phase 5 — 세트 목록 화면 (홈)
  11. SetCard.tsx, SetGrid.tsx
  12. app/page.tsx

Phase 6 — 세트 상세 화면
  13. CardItem.tsx, CardGrid.tsx
  14. FilterPanel.tsx (희귀도 필터)
  15. app/sets/[setId]/page.tsx

Phase 7 — 카드 상세 화면
  16. CardDetail.tsx (능력/기술/시세 포함)
  17. app/cards/[cardId]/page.tsx

Phase 8 — 검색 화면
  18. SearchBar.tsx, FilterPanel 확장
  19. app/search/page.tsx
```

---

## 14. Claude Code 실행 프롬프트 예시

아래 프롬프트를 Claude Code에 그대로 입력하여 단계별 개발을 진행한다.

```
이 문서(pokemon-tcg-pokedex-spec.md)를 기준으로
Phase 1 ~ Phase 2 (프로젝트 초기 설정 + 프록시 API Routes) 를 구현해줘.

조건:
- Next.js 16 App Router + TypeScript + Tailwind CSS v4
- API Key는 .env.local의 POKEMON_TCG_API_KEY 환경변수로만 사용
- 클라이언트 코드에 API Key 노출 금지
- 각 route.ts에 에러 처리 포함
- 구현 완료 후 curl로 /api/sets 동작 확인
```

---

## 15. 참고 링크

| 자료 | URL |
|------|-----|
| Pokemon TCG API 공식 문서 | https://docs.pokemontcg.io |
| API 개발자 포털 (키 관리) | https://dev.pokemontcg.io |
| 카드 이미지 CDN | https://images.pokemontcg.io |
| TCGPlayer 시세 확인 | https://www.tcgplayer.com |
| Next.js App Router 문서 | https://nextjs.org/docs/app |
| TanStack Query 문서 | https://tanstack.com/query |
