'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Link from 'next/link';
import { diaryJson } from '@/lib/diary/client';
import { DIARY_MOODS, DiaryEntry } from '@/lib/diary/types';
import { validateEntry } from '@/lib/diary/validation';
import { useDiaryDraft } from '@/hooks/useDiaryDraft';
import { DiaryPhotoPicker } from './DiaryPhotoPicker';

export function DiaryEntryForm({ initial }: { initial?: DiaryEntry }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [values, setValues] = useState({ entryDate: initial?.entryDate ?? searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd'), mood: initial?.mood ?? null as string | null, content: initial?.content ?? '' });
  const [files, setFiles] = useState<File[]>([]);
  const [existing, setExisting] = useState(() => (initial?.photoPaths ?? []).map((path, i) => ({ path, url: initial!.photoUrls[i] })));
  const [dirty, setDirty] = useState(false);
  const [baselineUpdatedAt] = useState(initial?.updatedAt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const draft = useDiaryDraft(values, !initial, dirty);
  const update = (next: Partial<typeof values>) => { setValues((value) => ({ ...value, ...next })); setDirty(true); };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || publishedId) return;
    const invalid = validateEntry(values);
    if (invalid) { setError(invalid); return; }
    setSubmitting(true);
    setError('');
    await draft.pause();
    try {
      const form = new FormData();
      form.set('entryDate', values.entryDate);
      form.set('content', values.content.trim());
      if (values.mood) form.set('mood', values.mood);
      if (initial) { form.set('updatedAt', baselineUpdatedAt!); form.set('retainedPhotos', JSON.stringify(existing.map((p) => p.path))); }
      files.forEach((file) => form.append('photos', file));
      const { entry } = await diaryJson<{ entry: { id: string } }>(initial ? `/api/diary/entries/${initial.id}` : '/api/diary/entries', { method: initial ? 'PUT' : 'POST', body: form });
      setPublishedId(entry.id);
      await queryClient.invalidateQueries({ queryKey: ['diary'] });
      if (!initial) {
        try { await draft.clearAfterPublish(); }
        catch { setError('일기는 저장됐지만 임시 저장 정리는 완료하지 못했어요. 일기 보기로 이동해주세요.'); return; }
      }
      router.push(`/diary/${entry.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '저장하지 못했습니다. 입력은 유지됩니다.');
      draft.resume();
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="diary-card space-y-6">
      {!initial && <div className="diary-comment space-y-2">
        <p role="status" className="diary-muted text-xs leading-6">{draft.status}</p>
        {draft.pending && <div className="flex flex-wrap gap-2">
          <button type="button" disabled={submitting || !!publishedId} className="diary-primary px-4 text-sm" onClick={() => {
            if (dirty && !confirm('현재 입력 대신 임시 저장한 이야기를 복원할까요?')) return;
            const restored = draft.restore(); if (restored) { setValues(restored); setDirty(false); }
          }}>이어서 쓰기</button>
          <button type="button" disabled={submitting || !!publishedId} className="diary-nav-link text-sm" onClick={() => { if (confirm('임시 저장한 이야기를 버릴까요?')) void draft.discard(); }}>초안 버리기</button>
        </div>}
      </div>}
      <fieldset disabled={submitting || !!publishedId} className="space-y-6 min-w-0">
        <div className="space-y-2"><label className="diary-form-label" htmlFor="entry-date">기록할 날짜</label><input id="entry-date" type="date" required value={values.entryDate} onChange={(e) => update({ entryDate: e.target.value })} className="diary-field" /></div>
        <fieldset><legend className="diary-form-label mb-3">오늘의 기분 <span className="diary-muted font-normal">· 선택</span></legend>
          <div className="flex gap-2 flex-wrap">{DIARY_MOODS.map((mood) => <button key={mood} type="button" aria-label={`${mood} 기분`} aria-pressed={values.mood === mood} className="diary-mood" onClick={() => update({ mood: values.mood === mood ? null : mood })}>{mood}</button>)}</div>
        </fieldset>
        <div className="space-y-2"><label className="diary-form-label" htmlFor="entry-content">오늘의 이야기</label><textarea id="entry-content" required maxLength={20000} rows={9} value={values.content} onChange={(e) => update({ content: e.target.value })} placeholder="오늘 있었던 일을 적어보세요..." className="diary-field resize-y leading-8" /><p className="text-right diary-muted text-xs">{values.content.length.toLocaleString()} / 20,000</p></div>
        <DiaryPhotoPicker files={files} existing={existing} onFiles={setFiles} onRemoveExisting={(path) => setExisting((photos) => photos.filter((photo) => photo.path !== path))} disabled={submitting || !!publishedId} />
      </fieldset>
      {error && <p role="alert" className="diary-accent text-sm leading-6">{error}</p>}
      {publishedId ? <Link className="diary-primary flex items-center justify-center" href={`/diary/${publishedId}`}>저장한 일기 보기</Link> : <div className="flex flex-col sm:flex-row gap-3">
        <button type="submit" disabled={submitting} className="diary-primary flex-1 py-3">{submitting ? '저장 중...' : initial ? '수정 저장하기' : '일기 저장하기'}</button>
        <Link className="diary-nav-link justify-center text-sm" href={initial ? `/diary/${initial.id}` : '/diary'}>돌아가기</Link>
      </div>}
    </form>
  );
}
