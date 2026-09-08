'use client';

import { useState } from 'react';
import Link from 'next/link';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTravelStore } from '@/store/travelStore';
import { useMounted } from '@/hooks/useMounted';
import { TripItinerary } from './TripItinerary';
import { TripMap } from './TripMap';
import { TripPacking } from './TripPacking';
import { TripBudget } from './TripBudget';

type Tab = 'itinerary' | 'map' | 'packing' | 'budget';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'itinerary', label: '📅 일정' },
  { id: 'map', label: '🗺️ 지도' },
  { id: 'packing', label: '🧳 준비물' },
  { id: 'budget', label: '💰 예산' },
];

export function TripDetail({ tripId }: { tripId: string }) {
  const mounted = useMounted();
  const trip = useTravelStore((s) => s.trips.find((t) => t.id === tripId));
  const [tab, setTab] = useState<Tab>('itinerary');

  if (!mounted) return null;

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">🧭</p>
        <p className="text-slate-600 dark:text-slate-300 mb-4">여행을 찾을 수 없어요.</p>
        <Link href="/travel" className="text-sky-600 text-sm font-medium hover:underline">
          ← 여행 목록으로
        </Link>
      </div>
    );
  }

  const start = parseISO(trip.startDate);
  const end = parseISO(trip.endDate);
  const nights = differenceInCalendarDays(end, start);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/travel" className="text-sm text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
        ← 여행 목록
      </Link>

      <div className="mt-3 mb-6 flex items-center gap-4">
        <span className="text-5xl">{trip.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{trip.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {trip.destination} · {format(start, 'yyyy년 M월 d일 (EEE)', { locale: ko })} ~{' '}
            {format(end, 'M월 d일 (EEE)', { locale: ko })}
            {nights > 0 ? ` · ${nights}박 ${nights + 1}일` : ' · 당일치기'}
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-xl bg-sky-100/70 dark:bg-slate-800/70 p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-white text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-400'
                : 'text-slate-600 hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'itinerary' && <TripItinerary trip={trip} />}
      {tab === 'map' && <TripMap trip={trip} />}
      {tab === 'packing' && <TripPacking trip={trip} />}
      {tab === 'budget' && <TripBudget trip={trip} />}
    </div>
  );
}
