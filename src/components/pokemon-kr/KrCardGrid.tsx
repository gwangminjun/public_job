import type { KrCard } from '@/lib/pokemon/kr-types';
import { KrCardItem } from './KrCardItem';
import { Skeleton } from '@/components/ui/Skeleton';

interface KrCardGridProps {
  cards: KrCard[];
  isLoading?: boolean;
}

export function KrCardGrid({ cards, isLoading }: KrCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <Skeleton className="h-40" />
            <div className="p-2.5 space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        카드를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <KrCardItem key={card.id} card={card} />
      ))}
    </div>
  );
}
