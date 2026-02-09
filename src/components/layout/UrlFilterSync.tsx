'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useFilterStore } from '@/store/filterStore';

const DEFAULT_LIMIT = 20;

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
  const hasHydratedFromUrl = useRef(false);

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
    setFilters,
  } = useFilterStore();

  useEffect(() => {
    const pageParam = Number(searchParams.get('page'));
    const limitParam = Number(searchParams.get('limit'));

    setFilters({
      keyword: searchParams.get('keyword')?.trim() || '',
      regions: parseListParam(searchParams.get('regions')),
      hireTypes: parseListParam(searchParams.get('hireTypes')),
      recruitTypes: parseListParam(searchParams.get('recruitTypes')),
      ncsTypes: parseListParam(searchParams.get('ncsTypes')),
      educationTypes: parseListParam(searchParams.get('educationTypes')),
      onlyOngoing: searchParams.get('onlyOngoing') !== 'false',
      page: Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
      limit: Number.isInteger(limitParam) && limitParam > 0 ? limitParam : DEFAULT_LIMIT,
    });

    hasHydratedFromUrl.current = true;
  }, [searchParams, setFilters]);

  useEffect(() => {
    if (!hasHydratedFromUrl.current) {
      return;
    }

    const nextParams = new URLSearchParams();

    if (keyword) nextParams.set('keyword', keyword);
    if (regions.length > 0) nextParams.set('regions', regions.join(','));
    if (hireTypes.length > 0) nextParams.set('hireTypes', hireTypes.join(','));
    if (recruitTypes.length > 0) nextParams.set('recruitTypes', recruitTypes.join(','));
    if (ncsTypes.length > 0) nextParams.set('ncsTypes', ncsTypes.join(','));
    if (educationTypes.length > 0) nextParams.set('educationTypes', educationTypes.join(','));
    if (!onlyOngoing) nextParams.set('onlyOngoing', 'false');
    if (page > 1) nextParams.set('page', page.toString());
    if (limit !== DEFAULT_LIMIT) nextParams.set('limit', limit.toString());

    const nextQueryString = nextParams.toString();
    const currentQueryString = searchParams.toString();

    if (nextQueryString === currentQueryString) {
      return;
    }

    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [
    router,
    pathname,
    searchParams,
    keyword,
    regions,
    hireTypes,
    recruitTypes,
    ncsTypes,
    educationTypes,
    onlyOngoing,
    page,
    limit,
  ]);

  return null;
}
