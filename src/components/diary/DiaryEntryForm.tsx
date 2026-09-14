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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="date"
        value={entryDate}
        onChange={(e) => setEntryDate(e.target.value)}
        className="rounded-lg border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
      />

      <div className="flex gap-2 flex-wrap">
        {DIARY_MOODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMood(mood === m ? null : m)}
            className={`text-xl w-10 h-10 rounded-full border transition-colors ${
              mood === m ? 'border-rose-500 bg-rose-100 dark:bg-rose-900/40' : 'border-transparent'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="오늘 있었던 일을 적어보세요..."
        rows={8}
        className="rounded-lg border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 resize-none"
      />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setPhotos(e.target.files)}
        className="text-sm"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-2.5 font-medium transition-colors"
      >
        {submitting ? '저장 중...' : '저장하기'}
      </button>
    </form>
  );
}
