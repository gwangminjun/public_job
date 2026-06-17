'use client';

import { useMemo, useState } from 'react';
import { useSetCards } from '@/hooks/useCards';
import { CardGrid } from '@/components/cards/CardGrid';

interface Props {
  setId: string;
}

export function SetDetailClient({ setId }: Props) {
  const [selectedRarity, setSelectedRarity] = useState('');
  const { data, isLoading } = useSetCards(setId);

  const allCards = data?.data ?? [];

  const rarities = useMemo(() => {
    const seen = new Map<string, number>();
    allCards.forEach((c) => {
      if (c.rarity) seen.set(c.rarity, (seen.get(c.rarity) ?? 0) + 1);
    });
    return Array.from(seen.entries()).sort((a, b) => b[1] - a[1]);
  }, [allCards]);

  const filteredCards = useMemo(
    () => (selectedRarity ? allCards.filter((c) => c.rarity === selectedRarity) : allCards),
    [allCards, selectedRarity]
  );

  return (
    <div>
      {/* 희귀도 필터 */}
      {!isLoading && rarities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedRarity('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedRarity
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300'
            }`}
          >
            전체 ({allCards.length})
          </button>
          {rarities.map(([rarity, count]) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedRarity === rarity
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300'
              }`}
            >
              {rarity}
              <span className="ml-1.5 text-xs opacity-60">({count})</span>
            </button>
          ))}
        </div>
      )}

      <CardGrid cards={filteredCards} isLoading={isLoading} />
    </div>
  );
}
