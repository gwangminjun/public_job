'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  if (isLoading) return <p className="text-center diary-muted py-12">불러오는 중...</p>;
  if (error || !entry) return <p className="text-center diary-accent py-12">{(error as Error)?.message}</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/diary" className="diary-nav-link self-start text-sm">← 일기 목록</Link>
      <div className="diary-card">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-semibold diary-accent">
            {format(parseISO(entry.entryDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </h1>
          <button onClick={handleDeleteEntry} className="diary-delete">
            삭제
          </button>
        </div>
        <p className="text-sm diary-muted mb-6 break-all">{entry.authorName}</p>
        <p className="whitespace-pre-wrap break-words text-base sm:text-lg leading-8 mb-6">
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

      <section className="diary-card" aria-labelledby="diary-comments">
        <h2 id="diary-comments" className="text-base font-semibold mb-5">댓글 {entry.comments.length}</h2>
        {entry.comments.length === 0 && <p className="diary-muted text-sm leading-6 mb-5">아직 댓글이 없어요. 따뜻한 한마디를 남겨주세요.</p>}
        <div className="flex flex-col gap-3 mb-5">
          {entry.comments.map((c) => (
            <div
              key={c.id}
              className="diary-comment text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium diary-accent break-all">{c.authorName}</span>
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="diary-delete"
                >
                  삭제
                </button>
              </div>
              <p className="whitespace-pre-wrap break-words leading-7">{c.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitComment} className="flex flex-col sm:flex-row gap-3 border-t border-[var(--diary-border)] pt-5">
          <textarea
            aria-label="댓글 내용"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="한마디 남기기..."
            className="diary-field flex-1 resize-y"
          />
          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="diary-primary px-5 text-sm sm:self-end"
          >
            등록
          </button>
        </form>
      </section>
    </div>
  );
}
