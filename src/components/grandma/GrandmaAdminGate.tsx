'use client';

import { useState } from 'react';

interface GrandmaAdminGateProps {
  configured: boolean;
}

export function GrandmaAdminGate({ configured }: GrandmaAdminGateProps) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/grandma/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? '비밀번호 확인에 실패했습니다.');
      }

      window.location.reload();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '비밀번호 확인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="rounded-[2rem] border shadow-sm p-8 text-center" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
        <p className="text-4xl mb-4">🔐</p>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#5C3317' }}>
          할머니 사이트 관리
        </h1>
        <p className="text-sm mb-6" style={{ color: '#A07850' }}>
          {configured
            ? '공유 비밀번호를 입력하면 관리자 화면에 들어갈 수 있어요.'
            : '서버에 `GRANDMA_ADMIN_PASSWORD`가 설정되지 않아 관리자 화면을 잠글 수 없습니다.'}
        </p>

        {configured ? (
          <form className="space-y-4 text-left" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
                required
              />
            </div>
            {error && (
              <div className="rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || password.trim().length === 0}
              className="w-full px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#7B4F2E' }}
            >
              {submitting ? '확인 중...' : '관리자 화면 열기'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
