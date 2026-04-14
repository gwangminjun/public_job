'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const redirectTo = searchParams.get('redirectTo') || '/account';

  const getEmailRedirectTo = () => {
    const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    if (envBase) {
      return `${envBase.replace(/\/$/, '')}/auth/login`;
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/login`;
    }

    return undefined;
  };

  const isEmailNotConfirmedError = (errorMessage: string) => {
    const normalized = errorMessage.toLowerCase();
    return normalized.includes('email not confirmed') || normalized.includes('email_not_confirmed');
  };

  const handleResendConfirmEmail = async () => {
    if (!email.trim()) {
      setMessage('인증 메일 재전송을 위해 이메일을 입력해 주세요.');
      return;
    }

    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    if (error) {
      setMessage(`인증 메일 재전송 실패: ${error.message}`);
      setResending(false);
      return;
    }

    setMessage('인증 메일을 다시 보냈습니다. 메일함(스팸함 포함)을 확인해 주세요.');
    setResending(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setNeedsEmailConfirm(false);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (isEmailNotConfirmedError(error.message)) {
            setNeedsEmailConfirm(true);
            setMessage('이메일 인증이 아직 완료되지 않았습니다. 인증 메일을 확인한 뒤 다시 로그인해 주세요.');
            return;
          }

          setMessage(`로그인 실패: ${error.message}`);
          return;
        }

        setMessage('로그인 성공! 요청한 페이지로 이동합니다.');
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
        },
      });
      if (error) {
        setMessage(`회원가입 실패: ${error.message}`);
        return;
      }

      setNeedsEmailConfirm(true);
      setMessage('회원가입 요청이 완료되었습니다. 이메일 인증 링크를 클릭한 뒤 로그인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-md mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Supabase 인증으로 계정 기반 기능을 사용합니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">비밀번호</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              placeholder="8자 이상"
            />
          </div>

          {message && (
            <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-md px-3 py-2">
              {message}
            </p>
          )}

          {needsEmailConfirm && (
            <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                1) 가입한 이메일의 인증 링크를 클릭하세요. 2) 스팸함/프로모션함도 확인하세요.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmEmail}
                disabled={resending}
                className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline disabled:opacity-60"
              >
                {resending ? '재전송 중...' : '인증 메일 다시 보내기'}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors"
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
            className="text-blue-600 dark:text-blue-300 hover:underline"
          >
            {mode === 'login' ? '회원가입으로 전환' : '로그인으로 전환'}
          </button>

          <Link href="/" className="text-gray-500 dark:text-gray-400 hover:underline">
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
