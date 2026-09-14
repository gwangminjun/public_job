import { Suspense } from 'react';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';

export default function DiaryWritePage() {
  return (
    <>
      <div className="diary-page-heading">
        <p className="diary-eyebrow">오늘의 마음</p>
        <h1>어떤 하루였나요?</h1>
        <p>길지 않아도 좋아요. 기억하고 싶은 순간을 적어주세요.</p>
      </div>
    <Suspense>
      <DiaryEntryForm />
    </Suspense>
    </>
  );
}
