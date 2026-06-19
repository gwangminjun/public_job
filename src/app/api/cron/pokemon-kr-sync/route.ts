import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { KrCard, KrVersionInfo } from '@/lib/pokemon/kr-types';

const RAW_BASE = 'https://raw.githubusercontent.com/kinbo-ptcg/ptcg-kr-db/main';
const API_BASE = 'https://api.github.com/repos/kinbo-ptcg/ptcg-kr-db';
const BATCH_SIZE = 15;
const UPSERT_CHUNK = 500;

const PRODUCT_FILES = [
  'product_data/pack/DP.json',
  'product_data/pack/BW.json',
  'product_data/pack/XY.json',
  'product_data/pack/SM.json',
  'product_data/pack/S.json',
  'product_data/pack/SV.json',
  'product_data/deck/DP.json',
  'product_data/deck/BW.json',
  'product_data/deck/XY.json',
  'product_data/deck/SM.json',
  'product_data/deck/S.json',
  'product_data/deck/SV.json',
  'product_data/promo/DP.json',
  'product_data/promo/BW.json',
  'product_data/promo/XY.json',
  'product_data/promo/SM.json',
  'product_data/promo/S.json',
  'product_data/promo/SV.json',
  'product_data/special/BW.json',
  'product_data/special/SM.json',
  'product_data/special/S.json',
  'product_data/special/SV.json',
];

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetch 실패: ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

async function getCardFilePaths(): Promise<string[]> {
  const tree = await fetchJson<{ tree: Array<{ path: string; type: string }> }>(
    `${API_BASE}/git/trees/HEAD?recursive=1`
  );
  return tree.tree
    .filter(
      (item) =>
        item.type === 'blob' &&
        item.path.endsWith('.json') &&
        (item.path.startsWith('card_data/pokemon/') ||
          item.path.startsWith('card_data/trainers/') ||
          item.path.startsWith('card_data/energy/')) &&
        !item.path.includes('README') &&
        !item.path.includes('.DS_Store')
    )
    .map((item) => item.path);
}

// version_info 단위로 카드 플래트닝, setIndex도 보완
function flattenCards(
  cards: KrCard[],
  now: string,
  setIndex: Map<string, Record<string, unknown>>
) {
  const cardRows: Array<Record<string, unknown>> = [];

  for (const card of cards) {
    if (!card.version_infos?.length) continue;

    const byProd = new Map<string, KrVersionInfo[]>();
    for (const vi of card.version_infos) {
      const key = `${vi.prodCode}-${vi.number}`;
      if (!byProd.has(key)) byProd.set(key, []);
      byProd.get(key)!.push(vi);

      // product_data에 없는 prodCode는 version_info 기반 플레이스홀더로 추가
      if (!setIndex.has(vi.prodCode)) {
        setIndex.set(vi.prodCode, {
          id: vi.prodCode,
          name: vi.prodName ?? vi.prodCode,
          series: 'ETC',
          type: 'pack',
          release_date: null,
          total: null,
          regulation: vi.regu ?? null,
          symbol_url: vi.prodSymbolURL ?? null,
          cover_img_url: null,
          raw_data: { id: vi.prodCode, name: vi.prodName, series: 'ETC', type: 'pack' },
          synced_at: now,
        });
      }
    }

    for (const [key, vis] of byProd.entries()) {
      vis.forEach((vi, idx) => {
        const id = vis.length === 1 ? key : `${key}-${idx + 1}`;
        cardRows.push({
          id,
          set_id: vi.prodCode,
          name: card.name,
          supertype: card.supertype ?? null,
          subtypes: card.subtypes ?? [],
          type: card.type ?? null,
          hp_int: card.hp ? (Number(card.hp) || null) : null,
          rarity: vi.rarity ?? null,
          number: vi.number,
          regulation: vi.regu ?? null,
          artist: vi.artist ?? null,
          raw_data: {
            ...card,
            version_infos: undefined,
            _versionInfo: vi,
            _dbId: id,  // DB 행 primary key — KrCardItem 링크 생성에 사용
          },
          synced_at: now,
        });
      });
    }
  }
  return cardRows;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createSupabaseAdminClient();
  const start = Date.now();
  const log: string[] = [];

  try {
    const now = new Date().toISOString();
    // setIndex: prodCode → row (product_data + version_info 양쪽에서 수집)
    const setIndex = new Map<string, Record<string, unknown>>();

    // ── 1. product_data에서 세트 수집 ────────────────────────────────
    // 모든 product 파일은 배열 형식 — 각 항목에 'code' 필드가 있음
    for (const filePath of PRODUCT_FILES) {
      try {
        const items = await fetchJson<Array<Record<string, unknown>>>(
          `${RAW_BASE}/${filePath}`
        );
        const prodType = filePath.includes('/pack/') ? 'pack'
          : filePath.includes('/deck/') ? 'deck'
          : filePath.includes('/special/') ? 'special'
          : 'promo';

        for (const prod of items) {
          const prodCode = prod.code as string;
          if (!prodCode) continue;
          const seriesArr = Array.isArray(prod.series) ? (prod.series as string[]) : [];
          const series = seriesArr[0] ?? 'ETC';
          const regsArr = Array.isArray(prod.regulations) ? (prod.regulations as string[]) : [];
          setIndex.set(prodCode, {
            id: prodCode,
            name: (prod.name as string) ?? prodCode,
            series,
            type: prodType,
            release_date: (prod.release_date as string) ?? null,
            total: (prod.total as number) ?? null,
            regulation: regsArr.join(',') || null,
            symbol_url: (prod.image_symbol_url as string) ?? null,
            cover_img_url: (prod.image_cover_url as string) ?? null,
            raw_data: { id: prodCode, ...prod },
            synced_at: now,
          });
        }
      } catch {
        // 파일이 없는 시리즈는 건너뜀
      }
    }

    // ── 2. 카드 파일 목록 조회 ────────────────────────────────────────
    const cardFilePaths = await getCardFilePaths();
    log.push(`카드 파일 수: ${cardFilePaths.length}개`);

    // ── 3. 카드 파일 배치 fetch + 플래트닝 (setIndex 동시 보완) ──────
    const allCardRows: Array<Record<string, unknown>> = [];

    for (let i = 0; i < cardFilePaths.length; i += BATCH_SIZE) {
      const batch = cardFilePaths.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((path) =>
          fetchJson<KrCard[]>(`${RAW_BASE}/${encodeURI(path)}`)
        )
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allCardRows.push(...flattenCards(result.value, now, setIndex));
        }
      }
    }

    // ── 3-1. 세트 upsert (product_data + version_info 수집분 합산) ───
    const setRows = [...setIndex.values()];
    const { error: setsErr } = await db
      .from('pokemon_kr_sets')
      .upsert(setRows, { onConflict: 'id' });
    if (setsErr) throw new Error(`세트 upsert 실패: ${setsErr.message}`);
    log.push(`세트 upsert: ${setRows.length}개`);

    // 이전 버그로 생성된 순수 숫자 ID 고아 세트 삭제
    const validIds = new Set(setRows.map((r) => r.id as string));
    const { data: orphanSets } = await db.from('pokemon_kr_sets').select('id');
    const orphanIds = (orphanSets ?? [])
      .map((r) => r.id as string)
      .filter((id) => !validIds.has(id) && /^\d+$/.test(id));
    if (orphanIds.length > 0) {
      await db.from('pokemon_kr_sets').delete().in('id', orphanIds);
      log.push(`고아 세트 삭제: ${orphanIds.length}개`);
    }

    // 카드 ID 중복 제거
    const dedupedCardRows = [...new Map(allCardRows.map((r) => [r.id, r])).values()];
    log.push(`카드 row 수: ${dedupedCardRows.length}장 (원본: ${allCardRows.length})`);

    // ── 4. 카드 청크 upsert ──────────────────────────────────────────
    for (let i = 0; i < dedupedCardRows.length; i += UPSERT_CHUNK) {
      const chunk = dedupedCardRows.slice(i, i + UPSERT_CHUNK);
      const { error: chunkErr } = await db
        .from('pokemon_kr_cards')
        .upsert(chunk, { onConflict: 'id' });
      if (chunkErr) throw new Error(`카드 upsert 실패 (offset ${i}): ${chunkErr.message}`);
    }
    log.push(`카드 upsert 완료`);

    const elapsed = Math.round((Date.now() - start) / 1000);
    return NextResponse.json({ ok: true, elapsed: `${elapsed}s`, log });
  } catch (error) {
    const elapsed = Math.round((Date.now() - start) / 1000);
    return NextResponse.json(
      { ok: false, elapsed: `${elapsed}s`, error: String(error), log },
      { status: 500 }
    );
  }
}
