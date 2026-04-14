'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { GrandmaPhoto } from '@/lib/grandma/shared';

interface GrandmaHeroShowcaseProps {
  photos: GrandmaPhoto[];
  isEventDay: boolean;
}

export function GrandmaHeroShowcase({ photos, isEventDay }: GrandmaHeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [photos.length]);

  return (
    <>
      {photos.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: index === activeIndex ? 1 : 0 }}
            >
              <Image src={photo.publicUrl} alt={photo.caption ?? ''} fill className="object-cover" priority={index === 0} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,248,238,0.12), rgba(123,79,46,0.34))' }} />
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(255,243,220,0.92) 0%, rgba(255,228,196,0.86) 55%, rgba(255,218,185,0.88) 100%)' }} />

      {isEventDay && (
        <>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 14 }).map((_, index) => (
              <span
                key={index}
                className="grandma-petal"
                style={{
                  left: `${8 + index * 6.5}%`,
                  animationDelay: `${(index % 6) * 0.6}s`,
                  animationDuration: `${6 + (index % 5)}s`,
                }}
              >
                🌸
              </span>
            ))}
          </div>
          <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-semibold shadow-lg" style={{ backgroundColor: 'rgba(123,79,46,0.92)', color: 'white' }}>
            오늘은 바로 잔칫날이에요 - 모두 함께 축하해요!
          </div>
        </>
      )}
    </>
  );
}
