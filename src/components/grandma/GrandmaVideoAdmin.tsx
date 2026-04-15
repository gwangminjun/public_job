'use client';

import { useMemo, useState } from 'react';
import { GrandmaEventConfig, isEmbeddableVideo } from '@/lib/grandma/shared';
import { GrandmaVideoCard } from './GrandmaVideoCard';

interface GrandmaVideoAdminProps {
  initialConfig: GrandmaEventConfig;
}

export function GrandmaVideoAdmin({ initialConfig }: GrandmaVideoAdminProps) {
  const [title, setTitle] = useState(initialConfig.celebration_video_title ?? '');
  const [videoUrl, setVideoUrl] = useState(initialConfig.celebration_video_url ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoGuide = useMemo(() => {
    const trimmed = videoUrl.trim();

    if (!trimmed) {
      return {
        tone: '#A07850',
        text: '유튜브, Vimeo, 또는 브라우저에서 직접 재생 가능한 영상 URL을 입력하세요.',
      };
    }

    if (isEmbeddableVideo(trimmed)) {
      return {
        tone: '#166534',
        text: '임베드 가능한 영상 URL입니다. 저장 후 메인/영상 페이지에서 바로 재생됩니다.',
      };
    }

    try {
      new URL(trimmed);
      return {
        tone: '#A16207',
        text: '유효한 URL이지만 유튜브/Vimeo 링크가 아니면 브라우저 기본 비디오 플레이어로 표시됩니다.',
      };
    } catch {
      return {
        tone: '#B91C1C',
        text: 'URL 형식이 올바르지 않습니다. `https://`로 시작하는 전체 주소를 입력하세요.',
      };
    }
  }, [videoUrl]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/grandma/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...initialConfig,
          celebration_video_title: title,
          celebration_video_url: videoUrl,
        }),
      });

      const result = (await response.json()) as { config?: GrandmaEventConfig; error?: string };

      if (!response.ok || !result.config) {
        throw new Error(result.error ?? '영상 정보 저장에 실패했습니다.');
      }

      setTitle(result.config.celebration_video_title ?? '');
      setVideoUrl(result.config.celebration_video_url ?? '');
      setMessage('영상 정보를 저장했습니다.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '영상 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl p-6 md:p-8 border shadow-sm" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
        <div className="mb-6">
          <h2 className="text-lg font-bold" style={{ color: '#5C3317' }}>
            영상 관리
          </h2>
          <p className="text-sm mt-1" style={{ color: '#A07850' }}>
            메인 페이지와 영상 페이지에 노출할 축하 영상 제목과 URL을 관리합니다.
          </p>
        </div>

        <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
              영상 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
              placeholder="예: 가족 축하 영상"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
              영상 URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs mt-2" style={{ color: videoGuide.tone }}>
              {videoGuide.text}
            </p>
          </div>

          {(message || error) && (
            <div
              className="rounded-xl px-3 py-2 text-sm"
              style={{
                backgroundColor: error ? '#FEE2E2' : '#ECFDF3',
                color: error ? '#B91C1C' : '#166534',
              }}
            >
              {error ?? message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#7B4F2E' }}
            >
              {saving ? '저장 중...' : '영상 정보 저장'}
            </button>
          </div>
        </form>
      </section>

      <GrandmaVideoCard title={title || initialConfig.celebration_video_title} videoUrl={videoUrl || null} />
    </div>
  );
}
