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
  const { data: entries, isLoading, error } = useQuery({ queryKey: ['diary', 'entries'], queryFn: fetchEntries });
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

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
    <div className="diary-card">
      <div className="flex items-center justify-between mb-4">
        <button aria-label="이전 달" onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="diary-nav-link">
          ←
        </button>
        <h2 aria-live="polite" className="text-lg font-semibold">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</h2>
        <button aria-label="다음 달" onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="diary-nav-link">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs diary-muted mb-3">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const entry = entriesByDate.get(dateKey);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              aria-label={`${format(day, 'yyyy년 M월 d일')}${entry ? ', 일기 있음' : ''}`}
              aria-current={isToday(day) ? 'date' : undefined}
              aria-pressed={selectedDate === dateKey}
              data-outside={!inMonth}
              className="diary-day"
            >
              <span>{format(day, 'd')}</span>
              <span aria-hidden="true" className={`diary-dot ${entry ? '' : 'invisible'}`} />
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 diary-muted text-xs mt-5 pt-4 border-t border-[var(--diary-border)]">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded border border-[var(--diary-accent)]" />오늘</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[var(--diary-button)]" />선택 날짜</span>
        <span className="flex items-center gap-2"><span className="diary-dot" />일기 작성일</span>
      </div>
      <div className="diary-comment mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm leading-6">
          {selectedDate.replaceAll('-', '. ')}
          <span className="block diary-muted">{isLoading ? '일기를 불러오는 중...' : error ? '일기 목록을 불러오지 못했습니다.' : entriesByDate.has(selectedDate) ? '이날의 기록이 있어요.' : '이날의 이야기를 남겨보세요.'}</span>
        </p>
        <button disabled={isLoading || !!error} onClick={() => handleDayClick(selectedDate)} className="diary-primary px-4 text-sm shrink-0">
          {entriesByDate.has(selectedDate) ? '일기 보기' : '일기 쓰기'}
        </button>
      </div>
    </div>
  );
}
