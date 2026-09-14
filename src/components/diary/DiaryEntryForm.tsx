'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { diaryFetch } from '@/lib/diary/client';
import { DIARY_MOODS } from '@/lib/diary/types';

export function DiaryEntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entryDate, setEntryDate] = useState(searchParams.get('date') ?? format(new Date(), 'yyyy-MM-dd'));
  const [mood, setMood] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.set('entryDate', entryDate);
    formData.set('content', content.trim());
    if (mood) formData.set('mood', mood);
    if (photos) {
      Array.from(photos).forEach((file) => formData.append('photos', file));
    }

    const res = await diaryFetch('/api/diary/entries', { method: 'POST', body: formData });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? '저장에 실패했습니다.');
      setSubmitting(false);
      return;
    }

    router.push('/diary');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="diary-card flex flex-col gap-5">
      <label className="diary-form-label" htmlFor="entry-date">기록할 날짜</label>
      <input
        id="entry-date"
        aria-label="일기 날짜"
        type="date"
        value={entryDate}
        onChange={(e) => setEntryDate(e.target.value)}
        className="diary-field"
      />

      <fieldset>
        <legend className="diary-form-label mb-3">오늘의 기분 <span className="diary-muted font-normal">· 선택</span></legend>
      <div className="flex gap-2 flex-wrap">
        {DIARY_MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(mood === m ? null : m)}
            aria-label={`${m} 기분`}
            aria-pressed={mood === m}
            className="diary-mood"
          >
            {m}
          </button>
        ))}
      </div>
      </fieldset>

      <label className="diary-form-label" htmlFor="entry-content">오늘의 이야기</label>
      <textarea
        id="entry-content"
        aria-label="일기 내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 있었던 일을 적어보세요..."
        rows={8}
        className="diary-field resize-y leading-8"
      />

      <label className="diary-form-label" htmlFor="entry-photos">함께 남길 사진 <span className="diary-muted font-normal">· 선택</span></label>
      <input
        id="entry-photos"
        aria-label="일기 사진 첨부"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setPhotos(e.target.files)}
        className="diary-field text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--diary-soft)] file:px-3 file:py-2 file:text-[var(--diary-text)]"
      />

      {error && <p className="text-sm diary-accent">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="diary-primary py-3"
      >
        {submitting ? '저장 중...' : '저장하기'}
      </button>
    </form>
  );
}
