import { getSetByIdFromDb, getCardsFromDb, getCardByIdFromDb } from './db';
import type { ApiListResponse, ApiSingleResponse, PokemonCard, PokemonSet } from './types';

export async function getSetFromServer(setId: string): Promise<ApiSingleResponse<PokemonSet>> {
  return getSetByIdFromDb(setId);
}

export async function getCardFromServer(cardId: string): Promise<ApiSingleResponse<PokemonCard>> {
  return getCardByIdFromDb(cardId);
}

export async function getAllCardsInSet(setId: string): Promise<ApiListResponse<PokemonCard>> {
  return getCardsFromDb({ q: `set.id:${setId}`, pageSize: 250, orderBy: 'number' });
}
