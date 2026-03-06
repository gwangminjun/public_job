'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type ProfileForm = {
  displayName: string;
  language: 'ko' | 'en';
  theme: 'system' | 'light' | 'dark';
  timezone: string;
};

interface AccountClientProps {
  userId: string;
  userEmail: string;
}

export function AccountClient({ userId, userEmail }: AccountClientProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    language: 'ko',
    theme: 'system',
    timezone: 'Asia/Seoul',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage('');

      const [{ data: profile, error: profileError }, { data: pref, error: prefError }] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_preferences')
          .select('language, theme, timezone')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      if (profileError || prefError) {
        setMessage(`계정 정보를 불러오지 못했습니다.`);
        setLoading(false);
        return;
      }

      setForm({
        displayName: profile?.display_name ?? '',
        language: (pref?.language ?? 'ko') as 'ko' | 'en',
        theme: (pref?.theme ?? 'system') as 'system' | 'light' | 'dark',
        timezone: pref?.timezone ?? 'Asia/Seoul',
      });

      setLoading(false);
    };

    void fetchProfile();
  }, [supabase, userId]);

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');

    const response = await fetch('/api/account/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName: form.displayName,
        language: form.language,
        theme: form.theme,
        timezone: form.timezone,
      }),
    });

    if (!response.ok) {
      let detail = '';
      try {
        const data = (await response.json()) as { message?: string; code?: string };
        detail = data.message ? ` (${data.message})` : '';
      } catch {
        detail = '';
      }

      setMessage(`저장에 실패했습니다. 잠시 후 다시 시도해 주세요.${detail}`);
      setSaving(false);
      return;
    }

    setMessage('계정 정보가 저장되었습니다.');
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
        <div className="max-w-2xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">계정 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-2xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">내 계정</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">로그인 사용자 기준 프로필/환경설정을 관리합니다.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
            <input
              type="text"
              value={userEmail}
              disabled
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-sm text-gray-600 dark:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">표시 이름</label>
            <input
              type="text"
              value={form.displayName}
              onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              placeholder="사용자 이름"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">언어</label>
              <select
                value={form.language}
                onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value as 'ko' | 'en' }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">테마</label>
              <select
                value={form.theme}
                onChange={(event) => setForm((prev) => ({ ...prev, theme: event.target.value as 'system' | 'light' | 'dark' }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="system">시스템</option>
                <option value="light">라이트</option>
                <option value="dark">다크</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">타임존</label>
              <input
                type="text"
                value={form.timezone}
                onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                placeholder="Asia/Seoul"
              />
            </div>
          </div>

          {message && (
            <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-md px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 transition-colors"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </main>
  );
}
