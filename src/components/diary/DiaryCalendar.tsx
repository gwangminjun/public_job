'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { diaryFetch } from '@/lib/diary/client';
import { DiaryEntry } from '@/lib/diary/types';

async function fetchEntries(): Promise<DiaryEntry[]> {
  const res = await diaryFetch('/api/diary/entries');
  if (!res.ok) throw new Error('일기 목록을 불러오지 못했습니다.');
  const data = await res.json();
  return data.entries;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function DiaryCalendar() {
  const router = useRouter();
  const { data: entries } = useQuery({ queryKey: ['diary', 'entries'], queryFn: fetchEntries });
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, DiaryEntry>();
    for (const entry of entries ?? []) {
      grouped.set(entry.entryDate, entry);
    }
    return grouped;
  }, [entries]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleDayClick = (dateKey: string) => {
    const entry = entriesByDate.get(dateKey);
    router.push(entry ? `/diary/${entry.id}` : `/diary/write?date=${dateKey}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="px-2 py-1 text-rose-500">
          ←
        </button>
        <h2 className="font-semibold">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</h2>
        <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="px-2 py-1 text-rose-500">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const entry = entriesByDate.get(dateKey);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(dateKey)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                inMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-700'
              } ${isToday(day) ? 'border border-rose-400' : ''} ${
                entry ? 'bg-rose-100 dark:bg-rose-900/40' : 'hover:bg-rose-50 dark:hover:bg-gray-800'
              }`}
            >
              <span>{format(day, 'd')}</span>
              {entry && <span className="text-xs leading-none">{entry.mood ?? '📝'}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
