'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { diaryJson } from '@/lib/diary/client';
import type { DiaryDraft } from '@/lib/diary/types';

export interface DraftValues { entryDate: string; content: string; mood: string | null }

export function useDiaryDraft(values: DraftValues, enabled: boolean, dirty: boolean) {
  const [pending, setPending] = useState<DiaryDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('임시 저장 확인 중...');
  const [retry, setRetry] = useState(0);
  const version = useRef<string | null>(null);
  const paused = useRef(false);
  const blocked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<void>>(Promise.resolve());
  const saved = useRef('');
  const signature = JSON.stringify(values);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    diaryJson<{ draft: DiaryDraft | null }>('/api/diary/draft').then(({ draft }) => {
      if (!active) return;
      version.current = draft?.version ?? null;
      setPending(draft);
      setReady(!draft);
      setStatus(draft ? '이전에 작성하던 이야기가 있어요.' : '입력 후 2초 뒤 자동으로 임시 저장해요.');
    }).catch((error: Error) => { if (active) setStatus(`${error.message} 일기는 계속 작성할 수 있어요.`); });
    return () => { active = false; };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready || !dirty || paused.current || blocked.current || signature === saved.current) return;
    timer.current = setTimeout(() => {
      inFlight.current = inFlight.current.then(async () => {
        if (paused.current || blocked.current || signature === saved.current) return;
        setStatus('임시 저장 중...');
        try {
          const response = await fetchDraftSave(JSON.parse(signature) as DraftValues, version.current);
          version.current = response.version;
          saved.current = signature;
          setStatus(`${new Date(response.updated_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 임시 저장됨 · 사진 제외`);
        } catch (error) {
          // Stop automatic writes after an ambiguous network result or version conflict.
          blocked.current = true;
          setStatus(`${error instanceof Error ? error.message : '임시 저장 실패'} 입력은 유지됩니다. 새로고침 전에 내용을 복사해주세요.`);
        }
      });
    }, 2000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [enabled, ready, dirty, signature, retry]);

  const pause = useCallback(async () => {
    paused.current = true;
    if (timer.current) clearTimeout(timer.current);
    await inFlight.current;
  }, []);
  const resume = () => { paused.current = false; setRetry((n) => n + 1); };
  const restore = () => {
    if (!pending) return null;
    const result = { entryDate: pending.entry_date, content: pending.content, mood: pending.mood };
    saved.current = JSON.stringify(result);
    setPending(null);
    setReady(true);
    setStatus('임시 저장한 이야기를 복원했어요.');
    return result;
  };
  const discard = async () => {
    try {
      if (version.current) await diaryJson(`/api/diary/draft?version=${version.current}`, { method: 'DELETE' });
      version.current = null;
      setPending(null);
      setReady(true);
      setStatus('새로운 이야기를 작성해주세요.');
    } catch (error) { setStatus(error instanceof Error ? error.message : '초안을 지우지 못했습니다.'); }
  };
  const clearAfterPublish = async () => {
    if (!ready || !version.current || blocked.current) return;
    // A version condition preserves any newer draft saved in another tab.
    await diaryJson(`/api/diary/draft?version=${version.current}`, { method: 'DELETE' });
    version.current = null;
  };
  return { pending, status, restore, discard, pause, resume, clearAfterPublish };
}

async function fetchDraftSave(values: DraftValues, version: string | null) {
  const { draft } = await diaryJson<{ draft: DiaryDraft }>('/api/diary/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, version }) });
  return draft;
}
