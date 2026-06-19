import { createClient } from '@supabase/supabase-js';
import type {
  ApiListResponse,
  ApiSingleResponse,
  CardSearchParams,
  PokemonCard,
  PokemonSet,
  SetSearchParams,
} from './types';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) throw new Error('Supabase 환경변수가 설정되지 않았습니다');
  return createClient(url, key);
}

// cardFilterStore.buildQuery() 결과인 Lucene 스타일 쿼리 파싱
interface ParsedCardQuery {
  name?: string;
  setId?: string;
  types?: string[];
  subtypes?: string[];
  rarity?: string;
  hpMin?: number;
  hpMax?: number;
}

function parsePokemonQuery(q: string): ParsedCardQuery {
  if (!q.trim()) return {};
  const result: ParsedCardQuery = {};

  const nameMatch = q.match(/name:(?:"([^"]+)"|(\S+))/);
  if (nameMatch) result.name = (nameMatch[1] ?? nameMatch[2]).replace(/\*+/g, '');

  const setMatch = q.match(/set\.id:(\S+)/);
  if (setMatch) result.setId = setMatch[1];

  const typeMatches = [...q.matchAll(/types:(\S+)/g)];
  if (typeMatches.length) result.types = typeMatches.map((m) => m[1]);

  const subtypeMatches = [...q.matchAll(/subtypes:(?:"([^"]+)"|(\S+))/g)];
  if (subtypeMatches.length) result.subtypes = subtypeMatches.map((m) => m[1] ?? m[2]);

  const rarityMatch = q.match(/rarity:(?:"([^"]+)"|(\S+))/);
  if (rarityMatch) result.rarity = rarityMatch[1] ?? rarityMatch[2];

  const hpMatch = q.match(/hp:\[(\*|\d+) TO (\*|\d+)\]/);
  if (hpMatch) {
    if (hpMatch[1] !== '*') result.hpMin = parseInt(hpMatch[1], 10);
    if (hpMatch[2] !== '*') result.hpMax = parseInt(hpMatch[2], 10);
  }

  return result;
}

export async function getSetsFromDb(params: SetSearchParams = {}): Promise<ApiListResponse<PokemonSet>> {
  const db = getClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 250;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = db.from('pokemon_sets').select('raw_data', { count: 'exact' });

  if (params.q) query = query.ilike('name', `%${params.q}%`);

  const orderBy = params.orderBy ?? '-releaseDate';
  const ascending = !orderBy.startsWith('-');
  const field = (ascending ? orderBy : orderBy.slice(1))
    .replace('releaseDate', 'release_date');
  query = query.order(field, { ascending, nullsFirst: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    data: (data ?? []).map((r) => r.raw_data as PokemonSet),
    page,
    pageSize,
    count: data?.length ?? 0,
    totalCount: count ?? 0,
  };
}

export async function getSetByIdFromDb(setId: string): Promise<ApiSingleResponse<PokemonSet>> {
  const db = getClient();
  const { data, error } = await db
    .from('pokemon_sets')
    .select('raw_data')
    .eq('id', setId)
    .single();

  if (error || !data) throw new Error(`세트를 찾을 수 없습니다: ${setId}`);
  return { data: data.raw_data as PokemonSet };
}

export async function getCardsFromDb(params: CardSearchParams = {}): Promise<ApiListResponse<PokemonCard>> {
  const db = getClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const parsed = parsePokemonQuery(params.q ?? '');

  let query = db.from('pokemon_cards').select('raw_data', { count: 'exact' });

  if (parsed.name) query = query.ilike('name', `${parsed.name}%`);
  if (parsed.setId) query = query.eq('set_id', parsed.setId);
  if (parsed.types?.length) {
    for (const t of parsed.types) query = query.contains('types', [t]);
  }
  if (parsed.subtypes?.length) {
    for (const s of parsed.subtypes) query = query.contains('subtypes', [s]);
  }
  if (parsed.rarity) query = query.eq('rarity', parsed.rarity);
  if (parsed.hpMin !== undefined) query = query.gte('hp_int', parsed.hpMin);
  if (parsed.hpMax !== undefined) query = query.lte('hp_int', parsed.hpMax);

  const orderBy = params.orderBy ?? 'name';
  const ascending = !orderBy.startsWith('-');
  const field = ascending ? orderBy : orderBy.slice(1);
  query = query.order(field, { ascending }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    data: (data ?? []).map((r) => r.raw_data as PokemonCard),
    page,
    pageSize,
    count: data?.length ?? 0,
    totalCount: count ?? 0,
  };
}

export async function getCardByIdFromDb(cardId: string): Promise<ApiSingleResponse<PokemonCard>> {
  const db = getClient();
  const { data, error } = await db
    .from('pokemon_cards')
    .select('raw_data')
    .eq('id', cardId)
    .single();

  if (error || !data) throw new Error(`카드를 찾을 수 없습니다: ${cardId}`);
  return { data: data.raw_data as PokemonCard };
}
