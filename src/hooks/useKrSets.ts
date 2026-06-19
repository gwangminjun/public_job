'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchKrSets } from '@/lib/pokemon/kr-api';
import type { KrSetSearchParams } from '@/lib/pokemon/kr-types';

export function useKrSets(params: KrSetSearchParams = {}) {
  return useQuery({
    queryKey: ['pokemon-kr-sets', params],
    queryFn: () => fetchKrSets(params),
    staleTime: 1000 * 60 * 60,
  });
}
