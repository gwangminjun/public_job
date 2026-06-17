import Image from 'next/image';
import Link from 'next/link';
import type { PokemonCard } from '@/lib/pokemon/types';
import { TYPE_COLORS } from '@/lib/pokemon/typeColors';

interface CardItemProps {
  card: PokemonCard;
}

export function CardItem({ card }: CardItemProps) {
  const price =
    card.tcgplayer?.prices?.holofoil?.market ??
    card.tcgplayer?.prices?.normal?.market ??
    null;

  return (
    <Link
      href={`/pokemon-tcg/cards/${card.id}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 flex items-center justify-center min-h-[10rem]">
        <Image
          src={card.images.small}
          alt={card.name}
          width={146}
          height={204}
          className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          unoptimized
        />
      </div>
      <div className="p-2.5 flex-1">
        <p className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-1 mb-1">
          {card.name}
        </p>
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500">#{card.number}</span>
          <div className="flex gap-1 flex-wrap justify-end">
            {card.types?.slice(0, 2).map((type) => (
              <span
                key={type}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        {card.rarity && (
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1">{card.rarity}</p>
        )}
        {price !== null && (
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ${price.toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  );
}
