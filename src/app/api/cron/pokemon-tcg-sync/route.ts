import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getPokemonApiBaseUrl, getPokemonApiKey } from '@/lib/server/pokemonApiKey';
import type { PokemonCard, PokemonSet } from '@/lib/pokemon/types';

const PAGE_SIZE = 250;
const BATCH_CONCURRENCY = 5; // 동시 요청 수
const UPSERT_CHUNK = 500;    // Supabase upsert 청크 크기

interface ApiPage<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  count: number;
}

async function fetchFromPokemonApi<T>(path: string): Promise<T> {
  const res = await fetch(`${getPokemonApiBaseUrl()}${path}`, {
    headers: { 'X-Api-Key': getPokemonApiKey() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Pokemon TCG API 오류: ${res.status} — ${path}`);
  return res.json() as Promise<T>;
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
    // ── 1. 세트 동기화 ──────────────────────────────────────────────
    const setsRes = await fetchFromPokemonApi<ApiPage<PokemonSet>>(
      `/sets?pageSize=250&orderBy=-releaseDate`
    );
    log.push(`세트 수집: ${setsRes.data.length}개`);

    const setRows = setsRes.data.map((set) => ({
      id: set.id,
      name: set.name,
      series: set.series,
      release_date: set.releaseDate ?? null,
      total: set.total,
      raw_data: set,
      synced_at: new Date().toISOString(),
    }));

    const { error: setsErr } = await db
      .from('pokemon_sets')
      .upsert(setRows, { onConflict: 'id' });
    if (setsErr) throw new Error(`세트 upsert 실패: ${setsErr.message}`);
    log.push(`세트 upsert 완료: ${setRows.length}개`);

    // ── 2. 카드 동기화 ──────────────────────────────────────────────
    // 첫 페이지로 총 개수 파악
    const firstPage = await fetchFromPokemonApi<ApiPage<PokemonCard>>(
      `/cards?pageSize=${PAGE_SIZE}&page=1&orderBy=id`
    );
    const totalPages = Math.ceil(firstPage.totalCount / PAGE_SIZE);
    log.push(`카드 수집 시작: 총 ${firstPage.totalCount}장, ${totalPages}페이지`);

    const allCards: PokemonCard[] = [...firstPage.data];

    // 나머지 페이지를 BATCH_CONCURRENCY 단위로 병렬 요청
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    for (let i = 0; i < remainingPages.length; i += BATCH_CONCURRENCY) {
      const batch = remainingPages.slice(i, i + BATCH_CONCURRENCY);
      const results = await Promise.all(
        batch.map((p) =>
          fetchFromPokemonApi<ApiPage<PokemonCard>>(
            `/cards?pageSize=${PAGE_SIZE}&page=${p}&orderBy=id`
          )
        )
      );
      allCards.push(...results.flatMap((r) => r.data));
    }
    log.push(`카드 수집 완료: ${allCards.length}장`);

    // DB 행으로 변환
    const cardRows = allCards.map((card) => ({
      id: card.id,
      set_id: card.set.id,
      name: card.name,
      types: card.types ?? [],
      subtypes: card.subtypes ?? [],
      rarity: card.rarity ?? null,
      hp_int: card.hp ? (parseInt(card.hp, 10) || null) : null,
      number: card.number,
      raw_data: card,
      synced_at: new Date().toISOString(),
    }));

    // UPSERT_CHUNK 단위로 청크 upsert
    for (let i = 0; i < cardRows.length; i += UPSERT_CHUNK) {
      const chunk = cardRows.slice(i, i + UPSERT_CHUNK);
      const { error: chunkErr } = await db
        .from('pokemon_cards')
        .upsert(chunk, { onConflict: 'id' });
      if (chunkErr) throw new Error(`카드 upsert 실패 (offset ${i}): ${chunkErr.message}`);
    }
    log.push(`카드 upsert 완료: ${cardRows.length}장`);

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
