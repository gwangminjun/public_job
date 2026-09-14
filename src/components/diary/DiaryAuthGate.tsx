'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { clearDiarySecret, diaryFetch, setDiarySecret } from '@/lib/diary/client';

export function DiaryAuthGate({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const [status, setStatus] = useState<'checking' | 'authorized' | 'locked'>('checking');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mounted) return;

    diaryFetch('/api/diary/entries')
      .then((res) => {
        if (res.ok) {
          setStatus('authorized');
        } else {
          clearDiarySecret();
          setStatus('locked');
        }
      })
      .catch(() => setStatus('locked'));
  }, [mounted]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDiarySecret(input.trim());
    const res = await diaryFetch('/api/diary/entries');
    if (res.ok) {
      setError('');
      setStatus('authorized');
    } else {
      clearDiarySecret();
      setError('비밀번호가 올바르지 않아요.');
    }
  };

  if (!mounted || status === 'checking') {
    return null;
  }

  if (status === 'locked') {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <form onSubmit={handleSubmit} className="diary-card w-full max-w-sm flex flex-col gap-4">
          <p className="text-center text-2xl mb-2">💌</p>
          <input
            aria-label="일기장 비밀번호"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="비밀번호"
            className="diary-field text-center"
            autoFocus
          />
          {error && <p className="text-sm diary-accent text-center">{error}</p>}
          <button
            type="submit"
            className="diary-primary py-3"
          >
            들어가기
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
