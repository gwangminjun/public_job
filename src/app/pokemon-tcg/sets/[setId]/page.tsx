import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSetFromServer } from '@/lib/pokemon/server';
import { SetDetailClient } from './SetDetailClient';

interface Props {
  params: Promise<{ setId: string }>;
}

export default async function SetDetailPage({ params }: Props) {
  const { setId } = await params;

  let set;
  try {
    const res = await getSetFromServer(setId);
    set = res.data;
  } catch {
    notFound();
  }

  return (
    <div>
      {/* 뒤로 가기 */}
      <Link
        href="/pokemon-tcg/sets"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-6 transition-colors"
      >
        ← 세트 목록
      </Link>

      {/* 세트 헤더 */}
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        {set.images.logo && (
          <Image
            src={set.images.logo}
            alt={set.name}
            width={220}
            height={80}
            className="h-16 w-auto object-contain"
            unoptimized
          />
        )}
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500">{set.series}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{set.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span>🃏 {set.total}장</span>
            <span>·</span>
            <span>📅 {set.releaseDate}</span>
            {set.legalities.standard === 'Legal' && (
              <>
                <span>·</span>
                <span className="text-green-600 dark:text-green-400 font-medium">스탠다드</span>
              </>
            )}
          </div>
        </div>
      </div>

      <SetDetailClient setId={setId} />
    </div>
  );
}
