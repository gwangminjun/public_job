'use client';

import { useMemo, useRef, useState } from 'react';
import {
  getGrandmaStoragePathFromUrl,
  getVideoPlatform,
  getVideoThumbnailUrl,
  GrandmaEventConfig,
  isEmbeddableVideo,
} from '@/lib/grandma/shared';
import { GrandmaVideoCard } from './GrandmaVideoCard';

interface GrandmaVideoAdminProps {
  initialConfig: GrandmaEventConfig;
}

export function GrandmaVideoAdmin({ initialConfig }: GrandmaVideoAdminProps) {
  const [title, setTitle] = useState(initialConfig.celebration_video_title ?? '');
  const [videoUrl, setVideoUrl] = useState(initialConfig.celebration_video_url ?? '');
  const [savedVideoUrl, setSavedVideoUrl] = useState(initialConfig.celebration_video_url ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUploadedPath, setPendingUploadedPath] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const videoPlatform = getVideoPlatform(videoUrl || null);
  const thumbnailUrl = getVideoThumbnailUrl(videoUrl || null);

  async function removeUploadedVideo(path: string) {
    await fetch('/api/grandma/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
  }

  async function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      if (pendingUploadedPath) {
        await removeUploadedVideo(pendingUploadedPath);
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/grandma/videos', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as { videoUrl?: string; path?: string; fileName?: string; error?: string };
      if (!response.ok || !result.videoUrl) {
        throw new Error(result.error ?? '영상 업로드에 실패했습니다.');
      }

      setVideoUrl(result.videoUrl);
      setPendingUploadedPath(result.path ?? null);
      if (!title.trim()) {
        setTitle(result.fileName?.replace(/\.[^.]+$/, '') ?? '축하 영상');
      }
      setMessage('영상 파일을 업로드했습니다. 저장 버튼을 누르면 기존 업로드 영상을 교체합니다.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '영상 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }

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
          previous_celebration_video_url: savedVideoUrl || null,
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
      setSavedVideoUrl(result.config.celebration_video_url ?? '');
      setPendingUploadedPath(getGrandmaStoragePathFromUrl(result.config.celebration_video_url ?? null));
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
              영상 파일 업로드
            </label>
            <div className="rounded-[1.5rem] border p-4 md:p-5" style={{ borderColor: '#E8C99A', backgroundColor: '#FFFDF7' }}>
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#5C3317' }}>
                    파일을 바로 업로드해서 연결
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#A07850' }}>
                    MP4, MOV 등 `video/*` 파일 업로드 가능. 새 파일을 올리면 이전 임시 업로드 파일은 자동 정리됩니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: '#7B4F2E' }}
                  >
                    {uploading ? '업로드 중...' : '영상 파일 선택'}
                  </button>
                  <span className="text-xs px-3 py-2 rounded-full self-center" style={{ backgroundColor: '#FFF3DC', color: '#7B4F2E' }}>
                    최대 300MB
                  </span>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs mt-2" style={{ color: '#A07850' }}>
              직접 업로드하면 공개 스토리지 버킷에 저장되고, 저장 버튼을 누르면 메인/영상 페이지에 반영됩니다.
            </p>
          </div>

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
            {videoPlatform && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FFF3DC', color: '#7B4F2E' }}>
                  플랫폼: {videoPlatform}
                </span>
                {isEmbeddableVideo(videoUrl) && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#ECFDF3', color: '#166534' }}>
                    임베드 가능
                  </span>
                )}
              </div>
            )}
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

      {(thumbnailUrl || videoPlatform) && (
        <section className="rounded-3xl p-6 md:p-8 border shadow-sm" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
          <div className="flex flex-col lg:flex-row gap-5">
            {thumbnailUrl ? (
              <div className="lg:w-80 shrink-0 overflow-hidden rounded-[1.5rem] border" style={{ borderColor: '#E8C99A', backgroundColor: '#FFFDF7' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnailUrl} alt="영상 썸네일" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="lg:w-80 shrink-0 rounded-[1.5rem] border flex items-center justify-center p-8" style={{ borderColor: '#E8C99A', backgroundColor: '#FFFDF7' }}>
                <div className="text-center">
                  <p className="text-4xl mb-2">🎬</p>
                  <p className="text-sm font-semibold" style={{ color: '#5C3317' }}>
                    썸네일 미리보기 없음
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3" style={{ color: '#5C3317' }}>
                영상 정보 미리보기
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {videoPlatform && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FFF3DC', color: '#7B4F2E' }}>
                    {videoPlatform}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FFFDF7', color: '#7B4F2E', border: '1px solid #E8C99A' }}>
                  {title || '제목 미설정'}
                </span>
              </div>
              <p className="text-sm break-all" style={{ color: '#A07850' }}>
                {videoUrl || '영상 URL이 아직 없습니다.'}
              </p>
            </div>
          </div>
        </section>
      )}

      <GrandmaVideoCard title={title || initialConfig.celebration_video_title} videoUrl={videoUrl || null} />
    </div>
  );
}
