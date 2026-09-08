'use client';

import { useMemo, useState } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTravelStore } from '@/store/travelStore';
import { Trip, PlaceCategory, PLACE_CATEGORIES } from '@/lib/travel/types';

export function TripItinerary({ trip }: { trip: Trip }) {
  const addPlace = useTravelStore((s) => s.addPlace);
  const deletePlace = useTravelStore((s) => s.deletePlace);
  const movePlace = useTravelStore((s) => s.movePlace);

  const days = useMemo(
    () =>
      eachDayOfInterval({ start: parseISO(trip.startDate), end: parseISO(trip.endDate) }).map(
        (d) => format(d, 'yyyy-MM-dd')
      ),
    [trip.startDate, trip.endDate]
  );

  const [formDate, setFormDate] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('sight');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !name.trim()) return;
    addPlace(trip.id, {
      name: name.trim(),
      date: formDate,
      category,
      memo: memo.trim() || undefined,
    });
    setName('');
    setMemo('');
    setFormDate(null);
  };

  return (
    <div className="space-y-5">
      {days.map((date, dayIndex) => {
        const places = trip.places.filter((p) => p.date === date);
        return (
          <section key={date} className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs text-white">
                  {dayIndex + 1}
                </span>
                {format(parseISO(date), 'M월 d일 (EEE)', { locale: ko })}
              </h2>
              <button
                onClick={() => {
                  setFormDate(formDate === date ? null : date);
                  setName('');
                  setMemo('');
                }}
                className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors"
              >
                {formDate === date ? '닫기' : '+ 장소 추가'}
              </button>
            </header>

            {formDate === date && (
              <form onSubmit={handleAdd} className="border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-800/40 px-5 py-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PLACE_CATEGORIES) as PlaceCategory[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        category === key
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {PLACE_CATEGORIES[key].emoji} {PLACE_CATEGORIES[key].label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="장소 이름"
                    autoFocus
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <input
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="메모 (선택)"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </form>
            )}

            {places.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-slate-400">아직 일정이 없어요.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {places.map((place, i) => (
                  <li key={place.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xl" title={PLACE_CATEGORIES[place.category].label}>
                      {PLACE_CATEGORIES[place.category].emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {place.name}
                        {place.lat != null && (
                          <span className="ml-1.5 text-xs text-emerald-600" title="지도에 위치 지정됨">
                            🗺️
                          </span>
                        )}
                      </p>
                      {place.memo && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{place.memo}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => movePlace(trip.id, place.id, 'up')}
                        disabled={i === 0}
                        className="rounded p-1 text-slate-400 hover:text-sky-600 disabled:opacity-30 transition-colors"
                        aria-label="위로"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => movePlace(trip.id, place.id, 'down')}
                        disabled={i === places.length - 1}
                        className="rounded p-1 text-slate-400 hover:text-sky-600 disabled:opacity-30 transition-colors"
                        aria-label="아래로"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => deletePlace(trip.id, place.id)}
                        className="rounded p-1 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
