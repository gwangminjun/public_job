'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GrandmaEventConfig, GrandmaPhoto, GrandmaTimelineEvent } from '@/lib/grandma/shared';
import { EventConfigAdmin } from './EventConfigAdmin';
import { PhotoAdmin } from './PhotoAdmin';
import { TimelineAdmin } from './TimelineAdmin';

interface GrandmaAdminTabsProps {
  config: GrandmaEventConfig;
  timeline: GrandmaTimelineEvent[];
  photos: GrandmaPhoto[];
}

const TAB_ITEMS = [
  {
    id: 'config',
    label: '잔치 정보 관리',
    emoji: '🎉',
    description: '행사 날짜, 장소, 주최, 영상 정보를 관리합니다.',
  },
  {
    id: 'timeline',
    label: '타임라인 관리',
    emoji: '🗓️',
    description: '인생 이벤트를 추가, 수정, 삭제하고 순서를 조정합니다.',
  },
  {
    id: 'photos',
    label: '사진 관리',
    emoji: '📷',
    description: '사진 업로드, 정렬, 설명 수정까지 한 번에 관리합니다.',
  },
] as const;

type TabId = (typeof TAB_ITEMS)[number]['id'];

function isTabId(value: string | null): value is TabId {
  return TAB_ITEMS.some((item) => item.id === value);
}

export function GrandmaAdminTabs({ config, timeline, photos }: GrandmaAdminTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const activeTab: TabId = isTabId(currentTab) ? currentTab : 'config';

  function handleTabChange(nextTab: TabId) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('tab', nextTab);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  const activeItem = useMemo(
    () => TAB_ITEMS.find((item) => item.id === activeTab) ?? TAB_ITEMS[0],
    [activeTab]
  );

  return (
    <div className="space-y-6">
      <section
        className="rounded-[2rem] border p-4 md:p-5 shadow-sm"
        style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TAB_ITEMS.map((item) => {
            const active = item.id === activeTab;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className="rounded-[1.5rem] px-4 py-4 text-left border transition-all duration-200"
                style={
                  active
                    ? {
                        backgroundColor: '#7B4F2E',
                        borderColor: '#7B4F2E',
                        color: 'white',
                        boxShadow: '0 10px 24px rgba(123, 79, 46, 0.18)',
                      }
                    : {
                        backgroundColor: '#FFFDF7',
                        borderColor: '#E8C99A',
                        color: '#7B4F2E',
                      }
                }
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-bold text-sm md:text-base">{item.label}</span>
                </div>
                <p className="text-xs md:text-sm" style={{ color: active ? 'rgba(255,255,255,0.82)' : '#A07850' }}>
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className="rounded-[2rem] border px-5 py-4 md:px-6 md:py-5"
        style={{ backgroundColor: '#FFFDF7', borderColor: '#E8C99A' }}
      >
        <p className="text-xs font-semibold tracking-[0.16em] uppercase mb-2" style={{ color: '#A07850' }}>
          Current Section
        </p>
        <h2 className="text-xl font-bold" style={{ color: '#5C3317' }}>
          {activeItem.emoji} {activeItem.label}
        </h2>
        <p className="text-sm mt-1" style={{ color: '#A07850' }}>
          {activeItem.description}
        </p>
      </div>

      {activeTab === 'config' && <EventConfigAdmin initialConfig={config} />}
      {activeTab === 'timeline' && <TimelineAdmin initialEvents={timeline} />}
      {activeTab === 'photos' && <PhotoAdmin initialPhotos={photos} />}
    </div>
  );
}
