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

      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        {set.symbolUrl && (
          <Image
            src={set.symbolUrl}
            alt={set.name}
            width={80}
            height={80}
            className="h-16 w-auto object-contain"
            unoptimized
          />
        )}
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{set.series} · {set.type}</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{set.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
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
