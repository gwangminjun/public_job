'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useKrSets } from '@/hooks/useKrSets';
import { Skeleton } from '@/components/ui/Skeleton';
import { KR_SERIES_ORDER } from '@/lib/pokemon/kr-types';
import type { KrSet } from '@/lib/pokemon/kr-types';

function SetCard({ set }: { set: KrSet }) {
  return (
    <Link
      href={`/pokemon-tcg/kr/sets/${set.id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 overflow-hidden"
    >
      <div className="bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center h-24 p-3">
        {set.symbolUrl ? (
          <Image
            src={set.symbolUrl}
            alt={set.name}
            width={80}
            height={80}
            className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            unoptimized
          />
        ) : (
          <span className="text-4xl">🃏</span>
        )}
      </div>
      <div className="p-3 flex-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">{set.series}</p>
        <p className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2">
          {set.name}
        </p>
        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
          <span>{set.total != null ? `🃏 ${set.total}장` : ''}</span>
          <span>{set.releaseDate ?? ''}</span>
        </div>
      </div>
    </Link>
  );
}

export default function KrSetsPage() {
  const { data, isLoading, error } = useKrSets({ pageSize: 500, orderBy: '-release_date' });
  const [activeSeries, setActiveSeries] = useState('전체');

  const sets = data?.data ?? [];

  const seriesList = useMemo(() => {
    const present = new Set(sets.map((s) => s.series));
    return ['전체', ...KR_SERIES_ORDER.filter((s) => present.has(s))];
  }, [sets]);

  const filteredSets = useMemo(
    () => (activeSeries === '전체' ? sets : sets.filter((s) => s.series === activeSeries)),
    [sets, activeSeries]
  );

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 dark:text-red-400 font-medium">제품 목록을 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">한국판 제품 목록</h1>
        {!isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            전체 {sets.length}개 제품 · {filteredSets.length}개 표시
          </p>
        )}
      </div>

      {!isLoading && seriesList.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {seriesList.map((series) => (
            <button
              key={series}
              onClick={() => setActiveSeries(series)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSeries === series
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              {series}
              {series !== '전체' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({sets.filter((s) => s.series === series).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Skeleton className="h-24" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredSets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}
