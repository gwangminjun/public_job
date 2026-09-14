'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearDiarySecret } from '@/lib/diary/client';
import { diaryShareDetails } from '@/lib/diary/share';

interface KakaoSdk {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (template: { objectType: 'text'; text: string; link: { mobileWebUrl: string; webUrl: string } }) => void };
}

declare global {
  interface Window { Kakao?: KakaoSdk }
}

let kakaoSdk: Promise<KakaoSdk> | null = null;

function loadKakaoSdk(): Promise<KakaoSdk> {
  if (window.Kakao) return Promise.resolve(window.Kakao);
  if (kakaoSdk) return kakaoSdk;
  kakaoSdk = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js';
    script.async = true;
    script.onload = () => window.Kakao ? resolve(window.Kakao) : reject(new Error('카카오톡 공유 도구를 불러오지 못했습니다.'));
    script.onerror = () => reject(new Error('카카오톡 공유 도구를 불러오지 못했습니다.'));
    document.head.append(script);
  });
  return kakaoSdk;
}

export function DiaryHeaderActions() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const details = typeof window === 'undefined' ? null : diaryShareDetails(window.location.origin);

  const share = async () => {
    if (!details || sharing) return;
    setSharing(true);
    setMessage('');
    try {
      const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
      if (key) {
        const kakao = await loadKakaoSdk();
        if (!kakao.isInitialized()) kakao.init(key);
        kakao.Share.sendDefault({ objectType: 'text', text: details.text, link: { mobileWebUrl: details.url, webUrl: details.url } });
      } else if (navigator.share) {
        await navigator.share(details);
      } else {
        await navigator.clipboard.writeText(details.url);
        setMessage('일기장 링크를 복사했어요.');
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') setMessage(error instanceof Error ? error.message : '공유하지 못했습니다. 다시 시도해주세요.');
    } finally { setSharing(false); }
  };

  const logout = () => {
    clearDiarySecret();
    queryClient.removeQueries({ queryKey: ['diary'] });
    window.location.assign('/diary');
  };

  return <div className="relative flex items-center gap-1">
    <button type="button" onClick={() => void share()} disabled={sharing} className="diary-nav-link text-xs" aria-label="카카오톡으로 일기장 공유">
      {sharing ? '준비 중...' : '카카오톡 공유'}
    </button>
    <button type="button" onClick={logout} className="diary-nav-link text-xs" aria-label="일기장 로그아웃">로그아웃</button>
    {message && <p role="status" className="diary-share-message">{message}</p>}
  </div>;
}
