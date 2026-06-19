'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchKrCards } from '@/lib/pokemon/kr-api';
import type { KrCardSearchParams } from '@/lib/pokemon/kr-types';

export function useKrCards(params: KrCardSearchParams & { enabled?: boolean }) {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['pokemon-kr-cards', queryParams],
    queryFn: () => fetchKrCards(queryParams),
    staleTime: 1000 * 60 * 10,
    enabled: enabled && !!queryParams.q,
  });
}

export function useKrSetCards(setId: string) {
  return useQuery({
    queryKey: ['pokemon-kr-set-cards', setId],
    queryFn: () => fetchKrCards({ q: `set.id:${setId}`, pageSize: 250, orderBy: 'number' }),
    staleTime: 1000 * 60 * 10,
  });
}
