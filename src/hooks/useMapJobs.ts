'use client';

import { useQuery } from '@tanstack/react-query';
import { JobListResponse } from '@/lib/types';
import { useFilterStore } from '@/store/filterStore';

async function fetchMapJobs(params: {
  keyword: string;
  regions: string[];
  hireTypes: string[];
  recruitTypes: string[];
  ncsTypes: string[];
  educationTypes: string[];
  onlyOngoing: boolean;
  sort: string;
  statFilter: string;
}): Promise<JobListResponse> {
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '1000',
    onlyOngoing: params.onlyOngoing.toString(),
    sort: params.sort,
  });

  if (params.keyword) searchParams.append('keyword', params.keyword);
  if (params.regions.length > 0) searchParams.append('regions', params.regions.join(','));
  if (params.hireTypes.length > 0) searchParams.append('hireTypes', params.hireTypes.join(','));
  if (params.recruitTypes.length > 0) searchParams.append('recruitTypes', params.recruitTypes.join(','));
  if (params.ncsTypes.length > 0) searchParams.append('ncsTypes', params.ncsTypes.join(','));
  if (params.educationTypes.length > 0) searchParams.append('educationTypes', params.educationTypes.join(','));
  if (params.statFilter) searchParams.append('statFilter', params.statFilter);

  const response = await fetch(`/api/jobs?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch map jobs');
  }

  return response.json();
}

export function useMapJobs(statFilter: string = '') {
  const {
    keyword,
    onlyOngoing,
    regions,
    hireTypes,
    recruitTypes,
    ncsTypes,
    educationTypes,
    sort,
  } = useFilterStore();

  return useQuery({
    queryKey: [
      'map-jobs',
      {
        keyword,
        onlyOngoing,
        regions,
        hireTypes,
        recruitTypes,
        ncsTypes,
        educationTypes,
        sort,
        statFilter,
      },
    ],
    queryFn: () =>
      fetchMapJobs({
        keyword,
        regions,
        hireTypes,
        recruitTypes,
        ncsTypes,
        educationTypes,
        onlyOngoing,
        sort,
        statFilter,
      }),
    staleTime: 1000 * 60 * 5,
  });
}
