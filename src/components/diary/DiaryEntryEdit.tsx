'use client';

import { useQuery } from '@tanstack/react-query';
import { diaryJson } from '@/lib/diary/client';
import type { DiaryEntry, DiaryIdentity } from '@/lib/diary/types';
import { DiaryEntryForm } from './DiaryEntryForm';

export function DiaryEntryEdit({ id }: { id: string }) {
  const entry = useQuery({ queryKey: ['diary', 'entry', id], queryFn: () => diaryJson<DiaryEntry>(`/api/diary/entries/${id}`) });
  const me = useQuery({ queryKey: ['diary', 'me'], queryFn: () => diaryJson<DiaryIdentity>('/api/diary/me') });
  if (entry.isPending || me.isPending) return <p role="status" className="diary-muted">일기를 불러오는 중...</p>;
  if (entry.error || me.error) return <p role="alert" className="diary-accent">{entry.error?.message ?? me.error?.message}</p>;
  if (entry.data.author !== me.data.author) return <p className="diary-muted">본인이 작성한 일기만 수정할 수 있어요.</p>;
  return <DiaryEntryForm key={id} initial={entry.data} />;
}
