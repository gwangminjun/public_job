import type {
  ApiListResponse,
  ApiSingleResponse,
  KrCard,
  KrCardSearchParams,
  KrSet,
  KrSetSearchParams,
} from './kr-types';

const BASE = '/api/pokemon-tcg/kr';

export async function fetchKrSets(params: KrSetSearchParams = {}): Promise<ApiListResponse<KrSet>> {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.series) p.set('series', params.series);
  if (params.type) p.set('type', params.type);
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.orderBy) p.set('orderBy', params.orderBy);

  const res = await fetch(`${BASE}/sets?${p}`);
  if (!res.ok) throw new Error('세트 목록 조회 실패');
  return res.json() as Promise<ApiListResponse<KrSet>>;
}

export async function fetchKrCards(
  params: KrCardSearchParams = {}
): Promise<ApiListResponse<KrCard>> {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.orderBy) p.set('orderBy', params.orderBy);

  const res = await fetch(`${BASE}/cards?${p}`);
  if (!res.ok) throw new Error('카드 목록 조회 실패');
  return res.json() as Promise<ApiListResponse<KrCard>>;
}

export async function fetchKrCard(cardId: string): Promise<ApiSingleResponse<KrCard>> {
  const res = await fetch(`${BASE}/cards/${cardId}`);
  if (!res.ok) throw new Error('카드 조회 실패');
  return res.json() as Promise<ApiSingleResponse<KrCard>>;
}
