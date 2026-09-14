import { Suspense } from 'react';
import { DiaryEntryForm } from '@/components/diary/DiaryEntryForm';

export default function DiaryWritePage() {
  return (
    <Suspense>
      <DiaryEntryForm />
    </Suspense>
  );
}
