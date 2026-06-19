import Image from 'next/image';
import Link from 'next/link';
import type { KrCard } from '@/lib/pokemon/kr-types';
import { KR_TYPE_COLORS } from '@/lib/pokemon/kr-types';

interface KrCardItemProps {
  card: KrCard;
}

export function KrCardItem({ card }: KrCardItemProps) {
  const vi = card._versionInfo;
  const imgUrl = vi?.cardImgURL ?? null;
  // _dbId: cron이 저장한 실제 DB primary key (suffix -1/-2 포함)
  const cardId = encodeURIComponent(card._dbId ?? (vi ? `${vi.prodCode}-${vi.number}` : card.id));

  return (
    <Link
      href={`/pokemon-tcg/kr/cards/${cardId}`}
      className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 flex items-center justify-center min-h-[10rem]">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={card.name}
            width={146}
            height={204}
            className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            unoptimized
          />
        ) : (
          <div className="h-40 w-28 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
            이미지 없음
          </div>
        )}
      </div>
      <div className="p-2.5 flex-1">
        <p className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-1 mb-1">
          {card.name}
        </p>
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500">#{vi?.number ?? ''}</span>
          {card.type && card.type !== '' && (
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${KR_TYPE_COLORS[card.type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              {card.type}
            </span>
          )}
        </div>
        {vi?.rarity && (
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1">{vi.rarity}</p>
        )}
      </div>
    </Link>
  );
}
