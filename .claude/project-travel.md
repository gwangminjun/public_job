# 여행 플래너 (`/travel/*`)

[TREK](https://github.com/mauriceboe/TREK)(셀프호스팅 여행 플래너, AGPL-3.0)에서 영감을 받아 만든 미니 여행 플래너 서브사이트입니다. TREK 코드는 사용하지 않았고(라이선스 문제 없음), 핵심 기능만 이 레포의 스택으로 새로 구현했습니다.

## 기능

- **여행 목록** (`/travel`) — 여행 생성/삭제 (이름, 목적지, 날짜 범위, 이모지)
- **여행 상세** (`/travel/[tripId]`) — 4개 탭:
  - 📅 **일정**: 날짜 범위에서 일자 자동 생성, 일자별 장소 추가(카테고리·메모), 순서 이동, 삭제
  - 🗺️ **지도**: Leaflet(OSM 타일). 장소를 선택하고 지도를 클릭해 위치 지정, 카테고리 이모지 마커 + 팝업
  - 🧳 **준비물**: 카테고리별 체크리스트, 진행률 바, 기본 템플릿 버튼
  - 💰 **예산**: 지출 기록, 총액/일평균, 카테고리별 비중 바

## 구조

| 파일 | 역할 |
|---|---|
| `src/lib/travel/types.ts` | Trip / TravelPlace / PackingItem / TravelExpense 타입, 카테고리 상수 |
| `src/store/travelStore.ts` | Zustand persist 스토어 (localStorage 키: `travel-trips`) — 모든 CRUD |
| `src/app/travel/layout.tsx` | 하늘색(sky) 테마 레이아웃 (grandma처럼 독립 테마, 다크모드 미적용) |
| `src/components/travel/TravelHome.tsx` | 여행 목록 + 생성 폼 |
| `src/components/travel/TripDetail.tsx` | 탭 셸 |
| `src/components/travel/TripItinerary.tsx` | 일정 탭 |
| `src/components/travel/TripMap.tsx` + `TripMapInner.tsx` | 지도 탭 — Inner를 `dynamic(ssr:false)`로 감싸 `useMapEvents` 훅 사용 |
| `src/components/travel/TripPacking.tsx` | 준비물 탭 |
| `src/components/travel/TripBudget.tsx` | 예산 탭 |

## 설계 노트

- **저장소**: 100% localStorage (Supabase 미사용) — 서버/DB 작업 없이 배포 가능. persist 스토어라 클라이언트 컴포넌트는 `useMounted()` 가드 후 렌더링 (hydration mismatch 방지).
- **일정 데이터 모델**: 장소는 `date: 'YYYY-MM-DD'` 필드로 일자에 귀속. 일자 배열은 `eachDayOfInterval`로 매번 파생 (별도 저장 안 함).
- **순서 이동**: `movePlace`는 같은 날짜 내에서만 스왑.
- Leaflet CSS는 루트 레이아웃(`src/app/layout.tsx`)에서 전역 로드, 마커 에셋은 `/public/leaflet`.
