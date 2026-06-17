import Image from 'next/image';
import Link from 'next/link';
import type { PokemonSet } from '@/lib/pokemon/types';

interface SetCardProps {
  set: PokemonSet;
}

export function SetCard({ set }: SetCardProps) {
  return (
    <Link
      href={`/pokemon-tcg/sets/${set.id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 h-24">
        {set.images.logo ? (
          <Image
            src={set.images.logo}
            alt={set.name}
            width={180}
            height={72}
            className="max-h-16 w-auto object-contain"
            unoptimized
          />
        ) : (
          <span className="text-4xl">🃏</span>
        )}
      </div>
      <div className="p-3 flex-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 truncate">{set.series}</p>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
          {set.name}
        </h3>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>🃏 {set.total}장</span>
          <span>{set.releaseDate}</span>
        </div>
      </div>
    </Link>
  );
}
