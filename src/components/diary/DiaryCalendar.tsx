'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import Link from 'next/link';
import { diaryJson } from '@/lib/diary/client';
import type { DiaryCalendarData } from '@/lib/diary/types';

export function DiaryCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const month = format(currentMonth, 'yyyy-MM');
  const { data, isPending, error, refetch } = useQuery({ queryKey: ['diary', 'calendar', month], queryFn: () => diaryJson<DiaryCalendarData>(`/api/diary/calendar?month=${month}`) });
  const days = eachDayOfInterval({ start: startOfWeek(currentMonth), end: endOfWeek(endOfMonth(currentMonth)) });
  const entriesByDate = new Map(data?.days.map((day) => [day.date, day]));
  const selected = entriesByDate.get(selectedDate);
  const changeMonth = (amount: number) => { const next = addMonths(currentMonth, amount); setCurrentMonth(next); setSelectedDate(format(next, 'yyyy-MM-dd')); };

  return <div className="space-y-5">
    <div className="diary-card">
      <div className="flex items-center justify-between mb-5"><button aria-label="이전 달" onClick={() => changeMonth(-1)} className="diary-nav-link">←</button><h2 aria-live="polite" className="text-lg font-semibold">{format(currentMonth, 'yyyy년 M월')}</h2><button aria-label="다음 달" onClick={() => changeMonth(1)} className="diary-nav-link">→</button></div>
      <div className="grid grid-cols-7 text-center text-xs diary-muted mb-3">{['일', '월', '화', '수', '목', '금', '토'].map((d) => <div key={d}>{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">{days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const count = entriesByDate.get(key)?.count ?? 0;
        return <button key={key} onClick={() => setSelectedDate(key)} aria-label={`${format(day, 'yyyy년 M월 d일')}${data ? `, 일기 ${count}개` : ''}`} aria-current={isToday(day) ? 'date' : undefined} aria-pressed={selectedDate === key} data-outside={!isSameMonth(day, currentMonth)} className="diary-day"><span>{format(day, 'd')}</span><span aria-hidden="true" className={`diary-dot ${count ? '' : 'invisible'}`} /></button>;
      })}</div>
      <div className="flex flex-wrap gap-4 diary-muted text-xs mt-5 pt-4 border-t border-[var(--diary-border)]">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded border border-[var(--diary-accent)]" />오늘</span><span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[var(--diary-button)]" />선택 날짜</span><span className="flex items-center gap-2"><span className="diary-dot" />일기 작성일</span>
        <button className="underline min-h-8" onClick={() => { setCurrentMonth(startOfMonth(new Date())); setSelectedDate(format(new Date(), 'yyyy-MM-dd')); }}>오늘로</button>
      </div>
    </div>
    {isPending && <p role="status" className="diary-muted text-sm">이달의 기록을 불러오는 중...</p>}
    {error && <div role="alert" className="diary-comment text-sm"><p>{error.message}</p><button className="diary-nav-link" onClick={() => void refetch()}>다시 시도</button></div>}
    {data && <>
      <section className="diary-card" aria-labelledby="selected-day">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 id="selected-day" className="font-semibold">{selectedDate.replaceAll('-', '. ')} <span className="diary-muted text-sm">· {selected?.count ?? 0}개의 기록</span></h2><Link href={`/diary/write?date=${selectedDate}`} className="diary-primary inline-flex items-center px-4 text-sm">이날 일기 쓰기</Link></div>
        <div aria-live="polite" className="space-y-3">{selected?.entries.length ? selected.entries.map((entry) => <Link key={entry.id} href={`/diary/${entry.id}`} className="diary-comment diary-entry block"><span className="diary-accent text-sm font-medium">{entry.mood} {entry.authorName}</span><p className="line-clamp-2 break-words leading-7 text-sm mt-2">{entry.excerpt}</p></Link>) : <p className="diary-muted text-sm leading-7">아직 기록이 없는 날이에요. 함께 기억할 이야기를 남겨보세요.</p>}</div>
      </section>
      <section className="diary-card" aria-labelledby="month-review"><p className="diary-eyebrow diary-accent text-xs mb-2">한 달 돌아보기</p><h2 id="month-review" className="font-semibold mb-5">{format(currentMonth, 'M월')}에 남긴 우리</h2>
        <div className="grid grid-cols-2 gap-3"><div className="diary-comment"><p className="diary-muted text-xs">남긴 일기</p><p className="text-2xl font-semibold mt-2">{data.summary.entries}<span className="text-sm diary-muted ml-1">개</span></p></div><div className="diary-comment"><p className="diary-muted text-xs">기록한 날</p><p className="text-2xl font-semibold mt-2">{data.summary.days}<span className="text-sm diary-muted ml-1">일</span></p></div></div>
        <h3 className="text-sm font-medium mt-5 mb-3">그날의 기분들</h3>
        {Object.keys(data.summary.moods).length ? <div className="flex flex-wrap gap-2">{Object.entries(data.summary.moods).sort((a, b) => b[1] - a[1]).map(([mood, count]) => <span key={mood} className="diary-author text-sm">{mood} <span className="ml-1">{count}회</span></span>)}</div> : <p className="diary-muted text-sm">아직 남긴 기분이 없어요.</p>}
      </section>
    </>}
  </div>;
}
