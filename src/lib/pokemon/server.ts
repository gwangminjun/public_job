import { getPokemonApiKey, getPokemonApiBaseUrl } from '@/lib/server/pokemonApiKey';
import type { ApiListResponse, ApiSingleResponse, PokemonCard, PokemonSet } from './types';

function headers(): HeadersInit {
  return { 'X-Api-Key': getPokemonApiKey() };
}

function base(): string {
  return getPokemonApiBaseUrl();
}

export async function getSetFromServer(setId: string): Promise<ApiSingleResponse<PokemonSet>> {
  const res = await fetch(`${base()}/sets/${setId}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`세트를 찾을 수 없습니다: ${setId}`);
  return res.json() as Promise<ApiSingleResponse<PokemonSet>>;
}

export async function getCardFromServer(cardId: string): Promise<ApiSingleResponse<PokemonCard>> {
  const res = await fetch(`${base()}/cards/${cardId}`, {
    headers: headers(),
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`카드를 찾을 수 없습니다: ${cardId}`);
  return res.json() as Promise<ApiSingleResponse<PokemonCard>>;
}

export async function getAllCardsInSet(setId: string): Promise<ApiListResponse<PokemonCard>> {
  const params = new URLSearchParams({
    q: `set.id:${setId}`,
    pageSize: '250',
    orderBy: 'number',
  });
  const res = await fetch(`${base()}/cards?${params}`, {
    headers: headers(),
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`카드 목록 조회 실패: ${setId}`);
  return res.json() as Promise<ApiListResponse<PokemonCard>>;
}
