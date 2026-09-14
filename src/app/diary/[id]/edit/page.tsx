import { Suspense } from 'react';
import { DiaryEntryEdit } from '@/components/diary/DiaryEntryEdit';

export default async function DiaryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><div className="diary-page-heading"><p className="diary-eyebrow">기록 다듬기</p><h1>다시 펼쳐보는 하루</h1><p>이야기와 사진을 수정하고 마음을 덧붙여보세요.</p></div><Suspense><DiaryEntryEdit id={id} /></Suspense></>;
}
