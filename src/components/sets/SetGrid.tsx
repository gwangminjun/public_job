import type { PokemonSet } from '@/lib/pokemon/types';
import { SetCard } from './SetCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface SetGridProps {
  sets: PokemonSet[];
  isLoading?: boolean;
}

export function SetGrid({ sets, isLoading }: SetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <Skeleton className="h-24" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        세트를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {sets.map((set) => (
        <SetCard key={set.id} set={set} />
      ))}
    </div>
  );
}
