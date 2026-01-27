'use client';

import { useQuery } from '@tanstack/react-query';
import { JobListResponse, Job } from '@/lib/types';
import { useFilterStore } from '@/store/filterStore';

function filterJobs(
  jobs: Job[],
  filters: {
    regions: string[];
    hireTypes: string[];
    recruitTypes: string[];
    ncsTypes: string[];
    educationTypes: string[];
  }
): Job[] {
  // 필터가 하나도 선택되지 않으면 원본 반환
  const hasAnyFilter =
    filters.regions.length > 0 ||
    filters.hireTypes.length > 0 ||
    filters.recruitTypes.length > 0 ||
    filters.ncsTypes.length > 0 ||
    filters.educationTypes.length > 0;

  if (!hasAnyFilter) {
    return jobs;
  }

  return jobs.filter((job) => {
    // 지역 필터
    if (filters.regions.length > 0) {
      const jobRegions = job.workRgnNmLst || '';
      const hasRegion = filters.regions.some((region) => jobRegions.includes(region));
      if (!hasRegion) return false;
    }

    // 고용형태 필터
    if (filters.hireTypes.length > 0) {
      const jobHireTypes = job.hireTypeNmLst || '';
      const hasHireType = filters.hireTypes.some((type) => jobHireTypes.includes(type));
      if (!hasHireType) return false;
    }

    // 채용구분 필터
    if (filters.recruitTypes.length > 0) {
      const jobRecruitType = job.recrutSeNm || '';
      const hasRecruitType = filters.recruitTypes.some((type) => jobRecruitType.includes(type));
      if (!hasRecruitType) return false;
    }

    // NCS 직무분류 필터
    if (filters.ncsTypes.length > 0) {
      const jobNcsTypes = job.ncsCdNmLst || '';
      const hasNcsType = filters.ncsTypes.some((type) => jobNcsTypes.includes(type));
      if (!hasNcsType) return false;
    }

    // 학력정보 필터
    if (filters.educationTypes.length > 0) {
      const jobEducation = job.acbgCondNmLst || '';
      const hasEducation = filters.educationTypes.some((type) => jobEducation.includes(type));
      if (!hasEducation) return false;
    }

    return true;
  });
}

async function fetchJobs(params: {
  page: number;
  limit: number;
  keyword: string;
  onlyOngoing: boolean;
  hasFilters: boolean;
}): Promise<JobListResponse> {
  // 필터가 있으면 더 많은 데이터를 가져와서 클라이언트에서 필터링
  const actualLimit = params.hasFilters ? 100 : params.limit;

  const searchParams = new URLSearchParams({
    page: params.hasFilters ? '1' : params.page.toString(),
    limit: actualLimit.toString(),
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
  const { page, limit, keyword, onlyOngoing, regions, hireTypes, recruitTypes, ncsTypes, educationTypes } = useFilterStore();

  // 필터 사용 여부 확인
  const hasFilters =
    regions.length > 0 ||
    hireTypes.length > 0 ||
    recruitTypes.length > 0 ||
    ncsTypes.length > 0 ||
    educationTypes.length > 0;

  const query = useQuery({
    queryKey: ['jobs', { page, limit, keyword, onlyOngoing, regions, hireTypes, recruitTypes, ncsTypes, educationTypes }],
    queryFn: () => fetchJobs({ page, limit, keyword, onlyOngoing, hasFilters }),
    staleTime: 1000 * 60 * 5, // 5분
    placeholderData: (previousData) => previousData,
  });

  // 필터가 없으면 원본 데이터 반환
  if (!hasFilters) {
    return query;
  }

  // 클라이언트 측 필터링 적용
  const filteredResult = query.data ? filterJobs(query.data.result || [], {
    regions,
    hireTypes,
    recruitTypes,
    ncsTypes,
    educationTypes,
  }) : [];

  // 클라이언트 측 페이지네이션
  const startIndex = (page - 1) * limit;
  const paginatedResult = filteredResult.slice(startIndex, startIndex + limit);

  const filteredData = query.data ? {
    ...query.data,
    result: paginatedResult,
    totalCount: filteredResult.length,
  } : query.data;

  return {
    ...query,
    data: filteredData,
  };
}
