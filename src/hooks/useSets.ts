'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSets } from '@/lib/pokemon/api';
import type { SetSearchParams } from '@/lib/pokemon/types';

export function useSets(params: SetSearchParams = {}) {
  return useQuery({
    queryKey: ['pokemon-sets', params],
    queryFn: () => fetchSets(params),
    staleTime: 1000 * 60 * 60,
  });
}
