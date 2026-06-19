import { createClient } from '@supabase/supabase-js';
import type {
  ApiListResponse,
  ApiSingleResponse,
  KrCard,
  KrCardSearchParams,
  KrSet,
  KrSetSearchParams,
} from './kr-types';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) throw new Error('Supabase 환경변수가 설정되지 않았습니다');
  return createClient(url, key);
}

interface ParsedKrQuery {
  name?: string;
  setId?: string;
  type?: string;
  supertype?: string;
  rarity?: string;
  hpMin?: number;
  hpMax?: number;
}

function parseKrQuery(q: string): ParsedKrQuery {
  if (!q.trim()) return {};
  const result: ParsedKrQuery = {};

  const nameMatch = q.match(/name:(?:"([^"]+)"|(\S+))/);
  if (nameMatch) result.name = (nameMatch[1] ?? nameMatch[2]).replace(/\*+$/, '');

  const setMatch = q.match(/set\.id:(\S+)/);
  if (setMatch) result.setId = setMatch[1];

  const typeMatch = q.match(/type:(?:"([^"]+)"|(\S+))/);
  if (typeMatch) result.type = typeMatch[1] ?? typeMatch[2];

  const supertypeMatch = q.match(/supertype:(?:"([^"]+)"|(\S+))/);
  if (supertypeMatch) result.supertype = supertypeMatch[1] ?? supertypeMatch[2];

  const rarityMatch = q.match(/rarity:(?:"([^"]+)"|(\S+))/);
  if (rarityMatch) result.rarity = rarityMatch[1] ?? rarityMatch[2];

  const hpMatch = q.match(/hp:\[(\*|\d+) TO (\*|\d+)\]/);
  if (hpMatch) {
    if (hpMatch[1] !== '*') result.hpMin = parseInt(hpMatch[1], 10);
    if (hpMatch[2] !== '*') result.hpMax = parseInt(hpMatch[2], 10);
  }

  return result;
}

export async function getKrSetsFromDb(
  params: KrSetSearchParams = {}
): Promise<ApiListResponse<KrSet>> {
  const db = getClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 250;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = db.from('pokemon_kr_sets').select('raw_data', { count: 'exact' });

  if (params.q) query = query.ilike('name', `%${params.q}%`);
  if (params.series) query = query.eq('series', params.series);
  if (params.type) query = query.eq('type', params.type);

  const orderBy = params.orderBy ?? '-release_date';
  const ascending = !orderBy.startsWith('-');
  const field = ascending ? orderBy : orderBy.slice(1);
  query = query.order(field, { ascending, nullsFirst: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    data: (data ?? []).map((r) => r.raw_data as KrSet),
    page,
    pageSize,
    count: data?.length ?? 0,
    totalCount: count ?? 0,
  };
}

export async function getKrSetByIdFromDb(setId: string): Promise<ApiSingleResponse<KrSet>> {
  const db = getClient();
  const { data, error } = await db
    .from('pokemon_kr_sets')
    .select('raw_data')
    .eq('id', setId)
    .single();

  if (error || !data) throw new Error(`세트를 찾을 수 없습니다: ${setId}`);
  return { data: data.raw_data as KrSet };
}

export async function getKrCardsFromDb(
  params: KrCardSearchParams = {}
): Promise<ApiListResponse<KrCard>> {
  const db = getClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const parsed = parseKrQuery(params.q ?? '');

  let query = db.from('pokemon_kr_cards').select('raw_data', { count: 'exact' });

  if (parsed.name) query = query.ilike('name', `${parsed.name}%`);
  if (parsed.setId) query = query.eq('set_id', parsed.setId);
  if (parsed.type) query = query.eq('type', parsed.type);
  if (parsed.supertype) query = query.eq('supertype', parsed.supertype);
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
    data: (data ?? []).map((r) => r.raw_data as KrCard),
    page,
    pageSize,
    count: data?.length ?? 0,
    totalCount: count ?? 0,
  };
}

export async function getKrCardByIdFromDb(cardId: string): Promise<ApiSingleResponse<KrCard>> {
  const db = getClient();
  const { data, error } = await db
    .from('pokemon_kr_cards')
    .select('raw_data')
    .eq('id', cardId)
    .single();

  if (error || !data) throw new Error(`카드를 찾을 수 없습니다: ${cardId}`);
  return { data: data.raw_data as KrCard };
}
