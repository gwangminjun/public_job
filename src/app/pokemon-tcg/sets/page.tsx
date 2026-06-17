'use client';

import { useMemo, useState } from 'react';
import { useSets } from '@/hooks/useSets';
import { SetGrid } from '@/components/sets/SetGrid';

export default function SetsPage() {
  const { data, isLoading, error } = useSets({ pageSize: 250, orderBy: '-releaseDate' });
  const [activeSeries, setActiveSeries] = useState('전체');

  const sets = data?.data ?? [];

  const seriesList = useMemo(() => {
    const seen = new Set<string>();
    sets.forEach((s) => seen.add(s.series));
    return ['전체', ...Array.from(seen)];
  }, [sets]);

  const filteredSets = useMemo(() => {
    if (activeSeries === '전체') return sets;
    return sets.filter((s) => s.series === activeSeries);
  }, [sets, activeSeries]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 dark:text-red-400 font-medium">세트 목록을 불러오지 못했습니다.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          POKEMON_TCG_API_KEY 환경변수를 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">카드 세트 목록</h1>
        {!isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            전체 {sets.length}개 세트 · {filteredSets.length}개 표시
          </p>
        )}
      </div>

      {/* 시리즈 필터 */}
      {!isLoading && seriesList.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {seriesList.map((series) => (
            <button
              key={series}
              onClick={() => setActiveSeries(series)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSeries === series
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-700'
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

      <SetGrid sets={filteredSets} isLoading={isLoading} />
    </div>
  );
}
