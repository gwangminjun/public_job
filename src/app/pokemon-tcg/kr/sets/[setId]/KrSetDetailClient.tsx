'use client';

import { useMemo, useState } from 'react';
import { useKrSetCards } from '@/hooks/useKrCards';
import { KrCardGrid } from '@/components/pokemon-kr/KrCardGrid';

interface Props {
  setId: string;
}

export function KrSetDetailClient({ setId }: Props) {
  const { data, isLoading } = useKrSetCards(setId);
  const [activeRarity, setActiveRarity] = useState('전체');

  const cards = data?.data ?? [];

  const rarities = useMemo(() => {
    const seen = new Set<string>();
    cards.forEach((c) => { if (c._versionInfo?.rarity) seen.add(c._versionInfo.rarity); });
    return ['전체', ...Array.from(seen).sort()];
  }, [cards]);

  const filtered = useMemo(
    () => (activeRarity === '전체' ? cards : cards.filter((c) => c._versionInfo?.rarity === activeRarity)),
    [cards, activeRarity]
  );

  return (
    <div>
      {!isLoading && rarities.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRarity(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeRarity === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              {r}
              {r !== '전체' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({cards.filter((c) => c._versionInfo?.rarity === r).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <KrCardGrid cards={filtered} isLoading={isLoading} />
    </div>
  );
}
