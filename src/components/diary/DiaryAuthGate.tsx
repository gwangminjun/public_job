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
        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <p className="text-center text-2xl mb-2">💌</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="비밀번호"
            className="rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-gray-800 px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-rose-400"
            autoFocus
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white py-2 font-medium transition-colors"
          >
            들어가기
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
