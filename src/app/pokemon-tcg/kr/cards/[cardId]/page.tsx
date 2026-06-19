import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKrCardByIdFromDb } from '@/lib/pokemon/kr-db';
import { KrCardDetail } from '@/components/pokemon-kr/KrCardDetail';

interface Props {
  params: Promise<{ cardId: string }>;
}

export default async function KrCardDetailPage({ params }: Props) {
  const { cardId } = await params;

  let card;
  try {
    const res = await getKrCardByIdFromDb(decodeURIComponent(cardId));
    card = res.data;
  } catch {
    notFound();
  }

  const setId = card._versionInfo?.prodCode;

  return (
    <div>
      <Link
        href={setId ? `/pokemon-tcg/kr/sets/${setId}` : '/pokemon-tcg/kr/sets'}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        ← 제품으로 돌아가기
      </Link>

      <KrCardDetail card={card} />
    </div>
  );
}
