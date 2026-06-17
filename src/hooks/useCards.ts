'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCards } from '@/lib/pokemon/api';
import type { CardSearchParams } from '@/lib/pokemon/types';

export function useCards(params: CardSearchParams & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['pokemon-cards', queryParams],
    queryFn: () => fetchCards(queryParams),
    staleTime: 1000 * 60 * 10,
    enabled: enabled && !!queryParams.q,
  });
}

export function useSetCards(setId: string) {
  return useQuery({
    queryKey: ['pokemon-set-cards', setId],
    queryFn: () => fetchCards({ q: `set.id:${setId}`, pageSize: 250, orderBy: 'number' }),
    staleTime: 1000 * 60 * 10,
  });
}
