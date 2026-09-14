import { DiaryEntryDetail } from '@/components/diary/DiaryEntryDetail';

export default async function DiaryEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DiaryEntryDetail id={id} />;
}
