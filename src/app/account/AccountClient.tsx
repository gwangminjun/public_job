'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { InstitutionWatchRule, NotificationTarget } from '@/lib/types';

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
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [watchRules, setWatchRules] = useState<InstitutionWatchRule[]>([]);
  const [notificationTargets, setNotificationTargets] = useState<NotificationTarget[]>([]);
  const [watchInstitution, setWatchInstitution] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
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

      const [
        { data: profile, error: profileError },
        { data: pref, error: prefError },
        watchRes,
        targetRes,
      ] = await Promise.all([
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
        fetch('/api/account/watch-rules'),
        fetch('/api/account/notification-targets'),
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

      if (watchRes.ok) {
        const watchData = (await watchRes.json()) as InstitutionWatchRule[];
        setWatchRules(Array.isArray(watchData) ? watchData : []);
      }

      if (targetRes.ok) {
        const targetData = (await targetRes.json()) as NotificationTarget[];
        const normalized = Array.isArray(targetData) ? targetData : [];
        setNotificationTargets(normalized);
      }

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

  const addWatchRule = async () => {
    const institutionName = watchInstitution.trim();
    if (!institutionName) {
      setMessage('기관명을 입력해 주세요.');
      return;
    }

    const response = await fetch('/api/account/watch-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institutionName, checkInterval: 'daily', active: true }),
    });

    const data = (await response.json()) as InstitutionWatchRule | { message?: string };
    if (!response.ok) {
      setMessage(`기관 watch 저장 실패: ${'message' in data ? data.message : 'unknown error'}`);
      return;
    }

    setWatchRules((prev) => [data as InstitutionWatchRule, ...prev]);
    setWatchInstitution('');
    setMessage('기관 watch가 저장되었습니다.');
  };

  const removeWatchRule = async (id: string) => {
    const response = await fetch(`/api/account/watch-rules/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage('기관 watch 삭제에 실패했습니다.');
      return;
    }

    setWatchRules((prev) => prev.filter((rule) => rule.id !== id));
    setMessage('기관 watch가 삭제되었습니다.');
  };

  const saveSlackTarget = async () => {
    const destination = slackWebhook.trim();
    if (!destination) {
      setMessage('Slack Webhook URL을 입력해 주세요.');
      return;
    }

    const response = await fetch('/api/account/notification-targets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination }),
    });

    const data = (await response.json()) as NotificationTarget | { message?: string };
    if (!response.ok) {
      setMessage(`Slack 연동 실패: ${'message' in data ? data.message : 'unknown error'}`);
      return;
    }

    const target = data as NotificationTarget;
    setNotificationTargets((prev) => {
      const filtered = prev.filter((item) => item.id !== target.id && item.channel !== 'slack');
      return [target, ...filtered];
    });
    setMessage('Slack Webhook 연동 및 테스트 발송이 완료되었습니다.');
  };

  const removeSlackTarget = async (id: string) => {
    const response = await fetch(`/api/account/notification-targets/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage('Slack 연동 해제에 실패했습니다.');
      return;
    }

    setNotificationTargets((prev) => prev.filter((target) => target.id !== id));
    setSlackWebhook('');
    setMessage('Slack 연동이 해제되었습니다.');
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setMessage('회원 탈퇴를 진행하려면 DELETE를 정확히 입력해 주세요.');
      return;
    }

    setDeleting(true);
    const response = await fetch('/api/account/delete', { method: 'POST' });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setMessage(`회원 탈퇴 실패: ${data.message || 'unknown error'}`);
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
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

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">기관 Watch</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">특정 기관의 신규 공고를 일 단위로 점검합니다.</p>

            <div className="mt-3 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={watchInstitution}
                onChange={(event) => setWatchInstitution(event.target.value)}
                placeholder="예: 한국산업인력공단"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={addWatchRule}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 transition-colors"
              >
                기관 추가
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {watchRules.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">등록된 기관 watch가 없습니다.</p>
              ) : (
                watchRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rule.institutionName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">주기: {rule.checkInterval} / 마지막 점검: {rule.lastCheckedAt || '아직 없음'}</p>
                    </div>
                    <button type="button" onClick={() => removeWatchRule(rule.id)} className="text-sm text-red-600 hover:underline">
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Slack 알림 채널</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Incoming Webhook URL을 등록하면 기관 watch 신규 공고를 Slack으로 보냅니다.</p>

            <div className="mt-3 flex flex-col gap-3">
              {notificationTargets.find((target) => target.channel === 'slack') && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  현재 등록된 Slack Webhook: {notificationTargets.find((target) => target.channel === 'slack')?.destination}
                </p>
              )}
              <input
                type="text"
                value={slackWebhook}
                onChange={(event) => setSlackWebhook(event.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
              <div className="flex gap-3">
                <button type="button" onClick={saveSlackTarget} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 transition-colors">
                  저장 및 테스트 발송
                </button>
                {notificationTargets.find((target) => target.channel === 'slack') && (
                  <button
                    type="button"
                    onClick={() => removeSlackTarget(notificationTargets.find((target) => target.channel === 'slack')!.id)}
                    className="rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 text-sm font-medium px-4 py-2.5 transition-colors"
                  >
                    연동 해제
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-red-200 dark:border-red-900">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">회원 탈퇴</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">계정을 삭제하면 관련 개인화 데이터와 알림 설정이 함께 정리됩니다. 되돌릴 수 없습니다.</p>
            <div className="mt-3 flex flex-col gap-3">
              <input
                type="text"
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder="DELETE 입력"
                className="w-full rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="self-start rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 transition-colors"
              >
                {deleting ? '처리 중...' : '회원 탈퇴'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
