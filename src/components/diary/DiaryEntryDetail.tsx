'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { diaryFetch } from '@/lib/diary/client';
import { DiaryEntryWithComments } from '@/lib/diary/types';

async function fetchEntry(id: string): Promise<DiaryEntryWithComments> {
  const res = await diaryFetch(`/api/diary/entries/${id}`);
  if (!res.ok) throw new Error('일기를 불러오지 못했습니다.');
  return res.json();
}

export function DiaryEntryDetail({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ['diary', 'entry', id];
  const { data: entry, isLoading, error } = useQuery({ queryKey, queryFn: () => fetchEntry(id) });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDeleteEntry = async () => {
    if (!confirm('이 일기를 삭제할까요?')) return;
    await diaryFetch(`/api/diary/entries/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['diary', 'entries'] });
    router.push('/diary');
  };

  const handleDeleteComment = async (commentId: string) => {
    await diaryFetch(`/api/diary/comments/${commentId}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey });
  };

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const res = await diaryFetch(`/api/diary/entries/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment.trim() }),
    });

    if (res.ok) {
      setComment('');
      queryClient.invalidateQueries({ queryKey });
    }
    setSubmitting(false);
  };

  if (isLoading) return <p className="text-center text-gray-400 py-12">불러오는 중...</p>;
  if (error || !entry) return <p className="text-center text-red-500 py-12">{(error as Error)?.message}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-rose-500">
            {format(parseISO(entry.entryDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </span>
          <button onClick={handleDeleteEntry} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            삭제
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">{entry.authorName}</p>
        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 mb-3">
          {entry.mood ? `${entry.mood} ` : ''}
          {entry.content}
        </p>
        {entry.photoUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {entry.photoUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-full h-40 rounded-lg object-cover" />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">댓글 {entry.comments.length}</h2>
        <div className="flex flex-col gap-2 mb-3">
          {entry.comments.map((c) => (
            <div
              key={c.id}
              className="rounded-lg bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-800 p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-rose-500">{c.authorName}</span>
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="한마디 남기기..."
            className="flex-1 rounded-lg border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-4 text-sm font-medium transition-colors"
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
}
