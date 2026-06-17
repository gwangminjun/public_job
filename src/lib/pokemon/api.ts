import type {
  ApiListResponse,
  ApiSingleResponse,
  CardSearchParams,
  PokemonCard,
  PokemonSet,
  SetSearchParams,
} from './types';

const BASE = '/api/pokemon-tcg';

export async function fetchSets(params: SetSearchParams = {}): Promise<ApiListResponse<PokemonSet>> {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.orderBy) p.set('orderBy', params.orderBy);

  const res = await fetch(`${BASE}/sets?${p}`);
  if (!res.ok) throw new Error('세트 목록 조회 실패');
  return res.json() as Promise<ApiListResponse<PokemonSet>>;
}

export async function fetchCards(params: CardSearchParams = {}): Promise<ApiListResponse<PokemonCard>> {
  const p = new URLSearchParams();
  if (params.q) p.set('q', params.q);
  if (params.page) p.set('page', String(params.page));
  if (params.pageSize) p.set('pageSize', String(params.pageSize));
  if (params.orderBy) p.set('orderBy', params.orderBy);

  const res = await fetch(`${BASE}/cards?${p}`);
  if (!res.ok) throw new Error('카드 목록 조회 실패');
  return res.json() as Promise<ApiListResponse<PokemonCard>>;
}
