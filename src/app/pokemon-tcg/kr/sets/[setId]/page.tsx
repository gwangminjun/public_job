import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKrSetByIdFromDb } from '@/lib/pokemon/kr-db';
import { KrSetDetailClient } from './KrSetDetailClient';

interface Props {
  params: Promise<{ setId: string }>;
}

export default async function KrSetDetailPage({ params }: Props) {
  const { setId } = await params;

  let set;
  try {
    const res = await getKrSetByIdFromDb(setId);
    set = res.data;
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href="/pokemon-tcg/kr/sets"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        ← 제품 목록
      </Link>

      <div className="flex flex-col sm:flex-row gap-5 items-start mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* 커버 이미지 */}
        {set.coverImgUrl && (
          <div className="relative w-full sm:w-48 h-44 sm:h-auto sm:min-h-[11rem] bg-gray-100 dark:bg-gray-900/60 flex-shrink-0">
            <Image
              src={set.coverImgUrl}
              alt={set.name}
              fill
              className="object-contain p-3"
              unoptimized
            />
          </div>
        )}
        <div className="p-5 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {set.symbolUrl && (
              <Image
                src={set.symbolUrl}
                alt=""
                width={24}
                height={24}
                className="h-6 w-auto object-contain"
                unoptimized
              />
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500">{set.series} · {set.type}</p>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{set.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            {set.total != null && <span>🃏 {set.total}장</span>}
            {set.releaseDate && <><span>·</span><span>📅 {set.releaseDate}</span></>}
            {set.regulation && <><span>·</span><span className="font-medium text-blue-600 dark:text-blue-400">레귤레이션 {set.regulation}</span></>}
          </div>
        </div>
      </div>

      <KrSetDetailClient setId={setId} />
    </div>
  );
}
