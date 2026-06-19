# Pokemon TCG 한국판 도감 — 개발 명세서

> 데이터 출처: [kinbo-ptcg/ptcg-kr-db](https://github.com/kinbo-ptcg/ptcg-kr-db) (GitHub JSON 파일)  
> 영문판(`/pokemon-tcg/*`)과 독립적으로 동작하는 한국판 서브사이트

---

## 1. 프로젝트 개요

### 목적
공식 포켓몬 코리아 카드 사이트 데이터를 GitHub 오픈소스 DB(`ptcg-kr-db`)를 통해
Supabase에 적재하고, 한국어 카드 도감 서비스를 영문판과 나란히 제공한다.

### 핵심 기능
| 기능 | 설명 |
|---|---|
| 랜딩 선택화면 | `/pokemon-tcg` 에서 EN / KR 선택 |
| 한국판 제품(세트) 목록 | 시리즈별(DP·BW·XY·SM·S·SV) 탭 |
| 제품 내 카드 목록 | 선택 제품의 카드 전체 조회 (등급 필터) |
| 카드 상세 | 한국어 이미지·이름·공격기·특성·플레이버 텍스트 |
| 한국어 카드 검색 | 이름·타입·등급·HP 조건 복합 검색 |

---

## 2. 데이터 소스 분석

### 2-1. 저장소 구조

```
ptcg-kr-db/
├── card_data/
│   ├── pokemon/gen1~gen9/   # 0001_이상해씨.json … (포켓몬 1종 = JSON 1파일)
│   ├── trainers/            # item.json, support.json, stadium.json, tool.json
│   └── energy/              # 기본_에너지.json, 특수_에너지.json
├── product_data/
│   ├── pack/   DP.json · BW.json · XY.json · SM.json · S.json · SV.json
│   ├── deck/   …
│   ├── special/…
│   └── promo/  …
└── card_data_product/       # 제품별 수록 카드 목록
```

### 2-2. 카드 JSON 스키마 (card_data)

각 파일은 **같은 포켓몬의 모든 판본**을 배열로 담는다.

```jsonc
[
  {
    "id": "SV2a-001",          // 게임 로직 기준 고유 ID
    "cardID": "이상풀070씨뿌020", // 카드ID (이름+타입+HP+기술 인코딩)
    "name": "이상해씨",
    "supertype": "포켓몬",       // 포켓몬 | 트레이너 | 에너지
    "subtypes": ["기본"],
    "hp": 70,
    "type": "(풀)",              // 단일 문자열 (영문판은 배열)
    "attacks": [{ "name": "씨뿌리기", "cost": "(풀)(무색)", "damage": "20", "text": "…" }],
    "abilities": [],
    "weakness":  { "type": "(불꽃)", "value": "×2" },
    "resistance":{ "type": "",      "value": "--" },
    "retreatCost": 2,
    "flavorText": "태어나서 얼마 동안 …",
    "regulationMark": ["G"],
    "pokemons": [{ "name": "이상해씨", "pokedexNumber": 1 }],
    "version_infos": [
      {
        "number": "001",
        "prodCode": "SV2a",
        "prodName": "스칼렛&바이올렛 강화 확장팩 「포켓몬 카드 151」",
        "prodSymbolURL": "https://cards.image.pokemonkorea.co.kr/…/SV2a.png",
        "artist": "Yuu Nishida",
        "rarity": "C",
        "cardImgURL": "https://cards.image.pokemonkorea.co.kr/…/SV2a_001.png?w=512",
        "cardPageURL": "https://pokemoncard.co.kr/cards/detail/…",
        "regu": "G",
        "debug": "1"          // 같은 prodCode 내 중복 구분자
      }
    ]
  }
]
```

### 2-3. 제품 JSON 스키마 (product_data/pack/SV.json)

```jsonc
{
  "SV1S": {
    "prodCode": "SV1S",
    "name": "포켓몬 카드 게임 스칼렛&바이올렛 확장팩 「스칼렛 ex」",
    "type": "pack",
    "series": "SV",
    "releaseDate": "2023-03-15",
    "inStandardRegulation": true,
    "printedTotal": "078",
    "total": 108,
    "regulation": "G",
    "price": "1,000원(1팩), 30,000원(1상자)",
    "symbolURL": "https://…/symbol/SV1S.png",
    "coverImgURL": "https://…/SV1S_cover.png"
  }
}
```

### 2-4. 플래트닝 전략

`version_infos` 배열의 **각 항목 = DB row 1개**로 플래트닝.

| 상황 | id 생성 규칙 |
|---|---|
| version_infos 1개 | `{prodCode}-{number}` (예: `SV2a-001`) |
| version_infos 2개 이상 (미러 등) | `{prodCode}-{number}-{debug}` (예: `SMP2-001-2`) |

`raw_data` = 카드 공통 스탯(`name`, `supertype`, `attacks`, `abilities`, ...) + 해당 `version_info` 병합

---

## 3. DB 스키마

### 3-1. `pokemon_kr_sets`

```sql
CREATE TABLE pokemon_kr_sets (
  id              TEXT PRIMARY KEY,       -- prodCode (예: SV2a, bw4)
  name            TEXT NOT NULL,          -- 한국어 제품명
  series          TEXT NOT NULL,          -- DP | BW | XY | SM | S | SV
  type            TEXT NOT NULL,          -- pack | deck | special | promo
  release_date    DATE,
  total           INT,
  regulation      TEXT,                   -- G | F | E | ... 레귤레이션 마크
  symbol_url      TEXT,
  cover_img_url   TEXT,
  raw_data        JSONB NOT NULL,
  synced_at       TIMESTAMPTZ DEFAULT now()
);

-- 공개 읽기 허용
ALTER TABLE pokemon_kr_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON pokemon_kr_sets FOR SELECT USING (true);
```

### 3-2. `pokemon_kr_cards`

```sql
CREATE TABLE pokemon_kr_cards (
  id            TEXT PRIMARY KEY,         -- "{prodCode}-{number}[-{debug}]"
  set_id        TEXT NOT NULL REFERENCES pokemon_kr_sets(id),
  name          TEXT NOT NULL,            -- 한국어 이름
  supertype     TEXT,                     -- 포켓몬 | 트레이너 | 에너지
  subtypes      TEXT[],
  type          TEXT,                     -- "(풀)" | "(불꽃)" 등 단일 문자열
  hp_int        INT,                      -- HP 수치 (정렬·범위 필터용)
  rarity        TEXT,
  number        TEXT,
  regulation    TEXT,                     -- regu 필드
  artist        TEXT,
  raw_data      JSONB NOT NULL,
  synced_at     TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_kr_cards_set_id  ON pokemon_kr_cards(set_id);
CREATE INDEX idx_kr_cards_name    ON pokemon_kr_cards(name text_pattern_ops);
CREATE INDEX idx_kr_cards_type    ON pokemon_kr_cards(type);
CREATE INDEX idx_kr_cards_rarity  ON pokemon_kr_cards(rarity);
CREATE INDEX idx_kr_cards_hp      ON pokemon_kr_cards(hp_int);
CREATE INDEX idx_kr_cards_super   ON pokemon_kr_cards(supertype);

-- 공개 읽기 허용
ALTER TABLE pokemon_kr_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON pokemon_kr_cards FOR SELECT USING (true);
```

---

## 4. 아키텍처

```
GitHub (ptcg-kr-db)           Supabase              Next.js App
─────────────────────         ──────────            ─────────────────────────────
product_data/**/*.json  ──┐                         /pokemon-tcg            (랜딩 EN/KR 선택)
card_data/**/*.json     ──┤  cron sync  ──▶  pokemon_kr_sets    ──▶  /pokemon-tcg/kr/sets
                          └─────────────▶  pokemon_kr_cards   ──▶  /pokemon-tcg/kr/sets/[setId]
                                                                    /pokemon-tcg/kr/cards/[cardId]
                                                                    /pokemon-tcg/kr/search
```

### cron 동기화 흐름

```
POST /api/cron/pokemon-kr-sync
 1. product_data/pack/{DP,BW,XY,SM,S,SV}.json  → pokemon_kr_sets upsert
 2. product_data/deck/*.json                    → pokemon_kr_sets upsert
 3. product_data/special/*.json                 → pokemon_kr_sets upsert
 4. card_data/pokemon/gen1~gen9/**/*.json        → version_info 플래트닝 → pokemon_kr_cards upsert
 5. card_data/trainers/**/*.json                → 동일 처리
 6. card_data/energy/**/*.json                  → 동일 처리
 7. 500장 청크 upsert (Supabase body size 제한)
```

---

## 5. 파일 구조

```
src/
├── lib/pokemon/
│   ├── kr-db.ts                      # Supabase 쿼리 레이어 (한국판)
│   └── kr-types.ts                   # KrCard, KrSet TypeScript 타입
├── app/api/
│   ├── cron/pokemon-kr-sync/
│   │   └── route.ts                  # GitHub fetch → Supabase upsert
│   └── pokemon-tcg/kr/
│       ├── sets/route.ts
│       ├── sets/[setId]/route.ts
│       ├── cards/route.ts
│       └── cards/[cardId]/route.ts
├── hooks/pokemon/
│   ├── useKrSets.ts
│   ├── useKrSetCards.ts
│   └── useKrCards.ts
├── components/pokemon-kr/
│   ├── KrCardGrid.tsx
│   ├── KrCardDetail.tsx
│   └── KrCardFilterPanel.tsx
└── app/pokemon-tcg/
    ├── page.tsx                      # 🆕 EN/KR 선택 랜딩 (기존은 sets로 redirect했을 것)
    └── kr/
        ├── layout.tsx                # 한국판 공통 레이아웃
        ├── sets/page.tsx
        ├── sets/[setId]/page.tsx
        ├── cards/[cardId]/page.tsx
        └── search/page.tsx
```

---

## 6. API 설계

### `GET /api/pokemon-tcg/kr/sets`
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `q` | string | 제품명 부분 일치 |
| `series` | string | DP\|BW\|XY\|SM\|S\|SV |
| `type` | string | pack\|deck\|special\|promo |
| `page` | number | 기본 1 |
| `pageSize` | number | 기본 250 |
| `orderBy` | string | 기본 `-release_date` |

### `GET /api/pokemon-tcg/kr/cards`
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `q` | string | `name:피카츄*`, `set.id:SV2a`, `type:(불꽃)`, `rarity:AR`, `hp:[100 TO 200]` |
| `page` | number | 기본 1 |
| `pageSize` | number | 기본 20 |
| `orderBy` | string | 기본 `name` |

---

## 7. 한국판 전용 타입 매핑

### 타입 색상 (영문 타입과 별개)
```
(풀)   → green   (불꽃) → red     (물)   → blue
(번개) → yellow  (초능력) → purple (격투) → orange
(악)   → dark    (강철) → steel   (용)   → teal
(무색) → gray    (페어리) → pink
```

### 슈퍼타입
```
포켓몬 → Pokémon   트레이너 → Trainer   에너지 → Energy
```

---

## 8. 랜딩 페이지 (`/pokemon-tcg`) 설계

- 기존 `/pokemon-tcg` 가 sets로 redirect 중이었다면 선택화면으로 교체
- 선택 → `localStorage['ptcg-lang']` 저장
- 다음 방문 시 자동 진입 (EN → `/pokemon-tcg/sets`, KR → `/pokemon-tcg/kr/sets`)
- 선택 화면에서 양쪽 모두 카드 이미지 샘플로 시각적 구분

---

## 9. 구현 태스크 목록

| # | 태스크 | 파일 |
|---|---|---|
| T1 | Supabase DDL 실행 | Supabase SQL Editor |
| T2 | KR 타입 정의 | `src/lib/pokemon/kr-types.ts` |
| T3 | KR DB 레이어 | `src/lib/pokemon/kr-db.ts` |
| T4 | KR API 라우트 4개 | `src/app/api/pokemon-tcg/kr/**` |
| T5 | cron sync 엔드포인트 | `src/app/api/cron/pokemon-kr-sync/route.ts` |
| T6 | TanStack Query 훅 3개 | `src/hooks/pokemon/useKr*.ts` |
| T7 | KrCardGrid / KrCardDetail 컴포넌트 | `src/components/pokemon-kr/` |
| T8 | 한국판 페이지 4개 | `src/app/pokemon-tcg/kr/**` |
| T9 | EN/KR 랜딩 선택화면 | `src/app/pokemon-tcg/page.tsx` |
| T10 | vercel.json cron 추가 | `vercel.json` |

---

## 10. 설계 결정 사항

| 결정 | 이유 |
|---|---|
| GitHub raw URL fetch | pokemontcg.io처럼 별도 API 서버 없음, 인증 불필요 |
| version_info 플래트닝 → 1 row | 영문판과 동일한 "카드 1개 = row 1개" 검색 구조 |
| `pokemon_kr_*` 별도 테이블 | 영문/한국판 충돌 없이 독립 운영, 스키마 차이 수용 |
| type 단일 TEXT (배열 아님) | 원본이 단일 문자열 `"(풀)"` — 영문판과 다름 |
| `text_pattern_ops` 인덱스 | 한국어 ILIKE 전방 일치(`이상해씨%`) 성능 확보 |
| 동기화 주기: 하루 1회 | 데이터 갱신 빈도 낮음, DB 캐싱으로 API 속도 문제 해결 |
