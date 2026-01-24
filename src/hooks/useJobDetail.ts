'use client';

import { useQuery } from '@tanstack/react-query';
import { JobDetailResponse } from '@/lib/types';

async function fetchJobDetail(sn: number): Promise<JobDetailResponse> {
  const response = await fetch(`/api/jobs/${sn}`);

  if (!response.ok) {
    throw new Error('Failed to fetch job detail');
  }

  return response.json();
}

export function useJobDetail(sn: number | null) {
  return useQuery({
    queryKey: ['job', sn],
    queryFn: () => fetchJobDetail(sn!),
    enabled: sn !== null,
    staleTime: 1000 * 60 * 30, // 30분
  });
}
