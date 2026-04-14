'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GrandmaPhoto } from '@/lib/grandma/shared';

interface PhotoGalleryProps {
  photos: GrandmaPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<GrandmaPhoto | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);

  const years = Array.from(
    new Set(photos.map((p) => p.taken_year).filter(Boolean) as number[])
  ).sort((a, b) => a - b);

  const filtered = filterYear ? photos.filter((p) => p.taken_year === filterYear) : photos;

  return (
    <>
      {/* 연도 필터 */}
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
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setFilterYear(y)}
              className="px-3 py-1 rounded-full text-sm font-medium border transition-colors"
              style={
                filterYear === y
                  ? { backgroundColor: '#7B4F2E', color: 'white', borderColor: '#7B4F2E' }
                  : { backgroundColor: 'white', color: '#7B4F2E', borderColor: '#C49A6C' }
              }
            >
              {y}년
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
              onClick={() => setLightbox(photo)}
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

      {/* 라이트박스 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              <Image
                src={lightbox.publicUrl}
                alt={lightbox.caption ?? ''}
                fill
                className="object-contain"
                sizes="512px"
              />
            </div>
            {(lightbox.caption || lightbox.taken_year) && (
              <div className="p-4 text-center" style={{ backgroundColor: '#FFFAF3' }}>
                {lightbox.caption && (
                  <p className="font-medium text-sm" style={{ color: '#5C3317' }}>
                    {lightbox.caption}
                  </p>
                )}
                {lightbox.taken_year && (
                  <p className="text-xs mt-1" style={{ color: '#A07850' }}>
                    {lightbox.taken_year}년
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
