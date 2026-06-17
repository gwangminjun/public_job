'use client';

import { useCardFilterStore } from '@/store/cardFilterStore';
import { useCards } from '@/hooks/useCards';
import { CardGrid } from '@/components/cards/CardGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { CardFilterPanel } from '@/components/search/CardFilterPanel';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 20;

export default function SearchPage() {
  const store = useCardFilterStore();
  const q = store.buildQuery();

  const { data, isLoading, error } = useCards({
    q: q || undefined,
    page: store.page,
    pageSize: PAGE_SIZE,
    orderBy: store.orderBy,
  });

  const cards = data?.data ?? [];
  const totalPages = Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">카드 검색</h1>

      <div className="mb-4">
        <SearchBar />
      </div>

      <div className="mb-6">
        <CardFilterPanel />
      </div>

      {q ? (
        <>
          {!isLoading && data && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {data.totalCount.toLocaleString()}개 카드
            </p>
          )}

          {error && (
            <div className="text-center py-10 text-red-600 dark:text-red-400">
              검색 중 오류가 발생했습니다.
            </div>
          )}

          <CardGrid cards={cards} isLoading={isLoading} />

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={store.page}
                totalPages={totalPages}
                onPageChange={store.setPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 text-gray-400 dark:text-gray-500">
          <p className="text-5xl mb-4">⚡</p>
          <p className="text-base">카드 이름이나 조건을 입력해 검색하세요</p>
          <p className="text-sm mt-2">예: Pikachu, Charizard, type:Fire ...</p>
        </div>
      )}
    </div>
  );
}
