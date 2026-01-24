'use client';

import { useQuery } from '@tanstack/react-query';
import { JobListResponse } from '@/lib/types';
import { useFilterStore } from '@/store/filterStore';

async function fetchJobs(params: {
  page: number;
  limit: number;
  keyword: string;
  onlyOngoing: boolean;
}): Promise<JobListResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    onlyOngoing: params.onlyOngoing.toString(),
  });

  if (params.keyword) {
    searchParams.append('keyword', params.keyword);
  }

  const response = await fetch(`/api/jobs?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }

  return response.json();
}

export function useJobs() {
  const { page, limit, keyword, onlyOngoing } = useFilterStore();

  return useQuery({
    queryKey: ['jobs', { page, limit, keyword, onlyOngoing }],
    queryFn: () => fetchJobs({ page, limit, keyword, onlyOngoing }),
    staleTime: 1000 * 60 * 5, // 5분
    placeholderData: (previousData) => previousData,
  });
}
