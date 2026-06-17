'use client';

import { useCardFilterStore } from '@/store/cardFilterStore';

export function SearchBar() {
  const { keyword, setKeyword } = useCardFilterStore();

  return (
    <div className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="카드 이름 검색 (예: Pikachu, Charizard...)"
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-shadow"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none">
        🔍
      </span>
    </div>
  );
}
