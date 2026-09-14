'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { diaryFetch, diaryJson } from '@/lib/diary/client';
import { DiaryEntryWithComments, DiaryIdentity } from '@/lib/diary/types';

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
  const [actionError, setActionError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { data: me } = useQuery({ queryKey: ['diary', 'me'], queryFn: () => diaryJson<DiaryIdentity>('/api/diary/me') });

  const handleDeleteEntry = async () => {
    if (!confirm('이 일기를 삭제할까요?')) return;
    setDeleting(true);
    setActionError('');
    try {
      await diaryJson(`/api/diary/entries/${id}`, { method: 'DELETE' });
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['diary', 'entries'] }), queryClient.invalidateQueries({ queryKey: ['diary', 'calendar'] })]);
      router.push('/diary');
    } catch (error) { setActionError(error instanceof Error ? error.message : '삭제하지 못했습니다.'); }
    finally { setDeleting(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeleting(true);
    setActionError('');
    try { await diaryJson(`/api/diary/comments/${commentId}`, { method: 'DELETE' }); await queryClient.invalidateQueries({ queryKey }); }
    catch (error) { setActionError(error instanceof Error ? error.message : '댓글을 삭제하지 못했습니다.'); }
    finally { setDeleting(false); }
  };

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setActionError('');
    try {
    await diaryJson(`/api/diary/entries/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: comment.trim() }),
    });

      setComment('');
      await queryClient.invalidateQueries({ queryKey });
    } catch (error) { setActionError(error instanceof Error ? error.message : '댓글을 등록하지 못했습니다.'); }
    finally { setSubmitting(false); }
  };

  if (isLoading) return <p className="text-center diary-muted py-12">불러오는 중...</p>;
  if (error || !entry) return <p className="text-center diary-accent py-12">{(error as Error)?.message}</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/diary" className="diary-nav-link self-start text-sm">← 일기 목록</Link>
      {actionError && <p role="alert" className="diary-comment diary-accent text-sm">{actionError}</p>}
      <div className="diary-card">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-semibold diary-accent">
            {format(parseISO(entry.entryDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </h1>
          {me?.author === entry.author && <div className="flex items-center gap-1"><Link href={`/diary/${id}/edit`} className="diary-nav-link text-xs">수정</Link><button disabled={deleting} onClick={handleDeleteEntry} className="diary-delete">
            삭제
          </button></div>}
        </div>
        <p className="text-sm diary-muted mb-6 break-all">{entry.authorName}</p>
        <p className="whitespace-pre-wrap break-words text-base sm:text-lg leading-8 mb-6">
          {entry.mood ? `${entry.mood} ` : ''}
          {entry.content}
        </p>
        {entry.photoUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {entry.photoUrls.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              url ? <img key={url} src={url} alt={`일기 사진 ${index + 1}`} className="w-full h-40 rounded-lg object-cover" /> : <p key={index} className="diary-muted text-sm">사진을 불러오지 못했어요.</p>
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
                {me?.author === c.author && <button
                  disabled={deleting}
                  onClick={() => handleDeleteComment(c.id)}
                  className="diary-delete"
                >
                  삭제
                </button>}
              </div>
              <p className="whitespace-pre-wrap break-words leading-7">{c.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitComment} className="flex flex-col sm:flex-row gap-3 border-t border-[var(--diary-border)] pt-5">
          <textarea
            aria-label="댓글 내용"
            rows={2}
            maxLength={2000}
            disabled={submitting}
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
