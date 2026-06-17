import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCardFromServer } from '@/lib/pokemon/server';
import { CardDetail } from '@/components/cards/CardDetail';

interface Props {
  params: Promise<{ cardId: string }>;
}

export default async function CardDetailPage({ params }: Props) {
  const { cardId } = await params;

  let card;
  try {
    const res = await getCardFromServer(cardId);
    card = res.data;
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/pokemon-tcg/sets/${card.set.id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-6 transition-colors"
      >
        ← {card.set.name}
      </Link>

      <CardDetail card={card} />
    </div>
  );
}
