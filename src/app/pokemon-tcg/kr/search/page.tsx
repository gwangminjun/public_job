'use client';

import { useState } from 'react';
import { useKrCards } from '@/hooks/useKrCards';
import { KrCardGrid } from '@/components/pokemon-kr/KrCardGrid';

const PAGE_SIZE = 20;

export default function KrSearchPage() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useKrCards({
    q: query ? `name:${query}*` : '',
    page,
    pageSize: PAGE_SIZE,
    orderBy: 'name',
    enabled: !!query,
  });

  const cards = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(input.trim());
    setPage(1);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">한국판 카드 검색</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="카드 이름을 입력하세요 (예: 피카츄)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {!query && (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">🃏</p>
          <p>카드 이름으로 검색해 보세요</p>
        </div>
      )}

      {query && (
        <>
          {!isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              &quot;{query}&quot; 검색 결과 — {totalCount}장
            </p>
          )}
          <KrCardGrid cards={cards} isLoading={isLoading} />

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                이전
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
