'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { GrandmaPhoto } from '@/lib/grandma/shared';

interface PhotoGalleryProps {
  photos: GrandmaPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const years = useMemo(
    () => Array.from(new Set(photos.map((photo) => photo.taken_year).filter(Boolean) as number[])).sort((a, b) => a - b),
    [photos]
  );

  const filtered = useMemo(
    () => (filterYear ? photos.filter((photo) => photo.taken_year === filterYear) : photos),
    [filterYear, photos]
  );

  const activeIndex = activePhotoId ? filtered.findIndex((photo) => photo.id === activePhotoId) : -1;
  const lightbox = activeIndex >= 0 ? filtered[activeIndex] : null;

  const closeLightbox = useCallback(() => {
    setActivePhotoId(null);
    setShareMessage(null);
  }, []);

  const moveLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (!lightbox || filtered.length === 0) return;

      const nextIndex = direction === 'prev'
        ? (activeIndex <= 0 ? filtered.length - 1 : activeIndex - 1)
        : (activeIndex === filtered.length - 1 ? 0 : activeIndex + 1);

      setActivePhotoId(filtered[nextIndex]?.id ?? null);
    },
    [activeIndex, filtered, lightbox]
  );

  async function handleShare(photo: GrandmaPhoto) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: '할머니 팔순 사진첩',
          text: photo.caption ?? '추억 사진을 함께 봐주세요.',
          url: photo.publicUrl,
        });
      } else {
        await navigator.clipboard.writeText(photo.publicUrl);
      }

      setShareMessage('사진 링크를 공유할 수 있도록 준비했어요.');
      window.setTimeout(() => setShareMessage(null), 2000);
    } catch {
      setShareMessage('공유를 취소했거나 지원되지 않는 환경입니다.');
      window.setTimeout(() => setShareMessage(null), 2000);
    }
  }

  useEffect(() => {
    if (!lightbox) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        moveLightbox('prev');
      }

      if (event.key === 'ArrowRight') {
        moveLightbox('next');
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeLightbox, lightbox, moveLightbox]);

  return (
    <>
      {years.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterYear(null)}
            className="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
            style={
              filterYear === null
                ? { backgroundColor: '#7B4F2E', color: 'white', borderColor: '#7B4F2E' }
                : { backgroundColor: 'white', color: '#7B4F2E', borderColor: '#C49A6C' }
            }
          >
            전체
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setFilterYear(year)}
              className="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
              style={
                filterYear === year
                  ? { backgroundColor: '#7B4F2E', color: 'white', borderColor: '#7B4F2E' }
                  : { backgroundColor: 'white', color: '#7B4F2E', borderColor: '#C49A6C' }
              }
            >
              {year}년
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#A07850' }}>
          <p className="text-4xl mb-3">📷</p>
          <p className="text-sm">아직 사진이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setActivePhotoId(photo.id)}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border"
              style={{ borderColor: '#E8C99A' }}
            >
              <Image
                src={photo.publicUrl}
                alt={photo.caption ?? ''}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />
              {photo.taken_year && (
                <span
                  className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(123,79,46,0.75)', color: 'white' }}
                >
                  {photo.taken_year}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl w-full rounded-[2rem] overflow-hidden shadow-2xl border"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full bg-black" style={{ aspectRatio: '4 / 3' }}>
              <Image
                src={lightbox.publicUrl}
                alt={lightbox.caption ?? ''}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />

              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveLightbox('prev')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-2xl text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    aria-label="이전 사진"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLightbox('next')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-2xl text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    aria-label="다음 사진"
                  >
                    ›
                  </button>
                </>
              )}

              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                ×
              </button>
            </div>

            <div className="p-4 md:p-5" style={{ backgroundColor: '#FFFAF3' }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  {lightbox.caption ? (
                    <p className="font-medium text-sm md:text-base" style={{ color: '#5C3317' }}>
                      {lightbox.caption}
                    </p>
                  ) : (
                    <p className="font-medium text-sm md:text-base" style={{ color: '#A07850' }}>
                      설명이 없는 사진입니다.
                    </p>
                  )}
                  {lightbox.taken_year && (
                    <p className="text-xs mt-1" style={{ color: '#A07850' }}>
                      {lightbox.taken_year}년 촬영
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleShare(lightbox)}
                    className="px-4 py-2 rounded-full text-sm font-semibold border"
                    style={{ borderColor: '#C49A6C', color: '#7B4F2E', backgroundColor: '#FFFDF7' }}
                  >
                    공유하기
                  </button>
                  {filtered.length > 1 && (
                    <div className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: '#FFF3DC', color: '#7B4F2E' }}>
                      {activeIndex + 1} / {filtered.length}
                    </div>
                  )}
                </div>
              </div>

              {shareMessage && (
                <p className="mt-3 text-xs" style={{ color: '#A07850' }}>
                  {shareMessage}
                </p>
              )}

              <p className="mt-3 text-xs" style={{ color: '#A07850' }}>
                키보드 방향키로 사진을 넘기고, `Esc`로 닫을 수 있어요.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
