'use client';

import dynamic from 'next/dynamic';
import { Trip } from '@/lib/travel/types';

const TripMapInner = dynamic(() => import('./TripMapInner').then((m) => m.TripMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-400">지도를 불러오는 중...</p>
    </div>
  ),
});

export function TripMap({ trip }: { trip: Trip }) {
  return <TripMapInner trip={trip} />;
}
