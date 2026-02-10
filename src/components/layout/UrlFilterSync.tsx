'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFilterStore } from '@/store/filterStore';
import { SortType } from '@/lib/types';

const DEFAULT_LIMIT = 20;
const DEFAULT_SORT = 'latest';

function parseListParam(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function UrlFilterSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URL 업데이트 중인지 추적하여 무한 루프 방지
  const isUpdatingUrl = useRef(false);

  const {
    page,
    limit,
    keyword,
    regions,
    hireTypes,
    recruitTypes,
    ncsTypes,
    educationTypes,
    onlyOngoing,
    sort,
    setFilters,
  } = useFilterStore();

  // 1. URL -> Store 동기화 (초기 로드 및 뒤로가기 시)
  useEffect(() => {
    // 우리가 방금 URL을 업데이트했다면 스토어 동기화 스킵
    if (isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }

    const pageParam = Number(searchParams.get('page'));
    const limitParam = Number(searchParams.get('limit'));
    const sortParam = searchParams.get('sort') as SortType;

    const newFilters = {
      keyword: searchParams.get('keyword')?.trim() || '',
      regions: parseListParam(searchParams.get('regions')),
      hireTypes: parseListParam(searchParams.get('hireTypes')),
      recruitTypes: parseListParam(searchParams.get('recruitTypes')),
      ncsTypes: parseListParam(searchParams.get('ncsTypes')),
      educationTypes: parseListParam(searchParams.get('educationTypes')),
      onlyOngoing: searchParams.get('onlyOngoing') !== 'false', // default true
      sort: sortParam && ['latest', 'deadline', 'personnel'].includes(sortParam) ? sortParam : DEFAULT_SORT,
      page: Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
      limit: Number.isInteger(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT,
    };

    // Store 업데이트 (Zustand는 값이 같으면 리렌더링하지 않음)
    setFilters(newFilters);
  }, [searchParams, setFilters]);

  // 2. Store -> URL 동기화 (사용자 인터랙션 시)
  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (keyword) nextParams.set('keyword', keyword);
    if (regions.length > 0) nextParams.set('regions', regions.join(','));
    if (hireTypes.length > 0) nextParams.set('hireTypes', hireTypes.join(','));
    if (recruitTypes.length > 0) nextParams.set('recruitTypes', recruitTypes.join(','));
    if (ncsTypes.length > 0) nextParams.set('ncsTypes', ncsTypes.join(','));
    if (educationTypes.length > 0) nextParams.set('educationTypes', educationTypes.join(','));
    
    // 기본값이 아닌 경우에만 URL에 추가
    if (!onlyOngoing) nextParams.set('onlyOngoing', 'false');
    if (sort !== DEFAULT_SORT) nextParams.set('sort', sort);
    if (page > 1) nextParams.set('page', page.toString());
    if (limit !== DEFAULT_LIMIT) nextParams.set('limit', limit.toString());

    const nextQueryString = nextParams.toString();
    const currentQueryString = searchParams.toString();

    // 변경사항이 없으면 무시
    if (nextQueryString === currentQueryString) {
      return;
    }

    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
    
    // URL 업데이트 플래그 설정
    isUpdatingUrl.current = true;
    router.replace(nextUrl, { scroll: false });
    
  }, [
    router,
    pathname,
    searchParams, // searchParams 비교를 위해 의존성 유지
    keyword,
    regions,
    hireTypes,
    recruitTypes,
    ncsTypes,
    educationTypes,
    onlyOngoing,
    sort,
    page,
    limit,
  ]);

  return null;
}
