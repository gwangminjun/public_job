'use client';

import { useState } from 'react';
import Link from 'next/link';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTravelStore } from '@/store/travelStore';
import { useMounted } from '@/hooks/useMounted';

const TRIP_EMOJIS = ['✈️', '🏝️', '🗻', '🏯', '🚂', '🏕️', '🌊', '🌆'];

function formatRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const nights = differenceInCalendarDays(end, start);
  const range = `${format(start, 'M월 d일 (EEE)', { locale: ko })} ~ ${format(end, 'M월 d일 (EEE)', { locale: ko })}`;
  return nights === 0 ? `${range} · 당일치기` : `${range} · ${nights}박 ${nights + 1}일`;
}

export function TravelHome() {
  const mounted = useMounted();
  const trips = useTravelStore((s) => s.trips);
  const addTrip = useTravelStore((s) => s.addTrip);
  const deleteTrip = useTravelStore((s) => s.deleteTrip);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [emoji, setEmoji] = useState(TRIP_EMOJIS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const canSubmit =
    title.trim() && destination.trim() && startDate && endDate && startDate <= endDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addTrip({ title: title.trim(), destination: destination.trim(), emoji, startDate, endDate });
    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">내 여행</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            일정 · 지도 · 준비물 · 예산을 한 곳에서 관리하세요.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {showForm ? '닫기' : '+ 새 여행'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-sky-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">여행 이름</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 여름 휴가"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">목적지</span>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="예) 제주도"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">출발일</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">도착일</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
          </div>
          <div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">아이콘</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {TRIP_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-9 w-9 rounded-lg text-lg transition-colors ${
                    emoji === e
                      ? 'bg-sky-100 dark:bg-sky-900/40 ring-2 ring-sky-500'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            여행 만들기
          </button>
        </form>
      )}

      {!mounted ? null : trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40 py-16 text-center">
          <p className="text-4xl mb-3">🧳</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            아직 여행이 없어요. <b>+ 새 여행</b>으로 첫 여행을 만들어보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group relative rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-400 transition-all"
            >
              <Link href={`/travel/${trip.id}`} className="block">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{trip.emoji}</span>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                      {trip.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.destination}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{formatRange(trip.startDate, trip.endDate)}</p>
                <div className="mt-3 flex gap-3 text-xs text-slate-400">
                  <span>📍 {trip.places.length}곳</span>
                  <span>
                    🧳 {trip.packing.filter((i) => i.packed).length}/{trip.packing.length}
                  </span>
                  <span>💳 {trip.expenses.length}건</span>
                </div>
              </Link>
              <button
                onClick={() => {
                  if (confirm(`'${trip.title}' 여행을 삭제할까요?`)) deleteTrip(trip.id);
                }}
                className="absolute top-3 right-3 rounded-md px-2 py-1 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                aria-label="여행 삭제"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
