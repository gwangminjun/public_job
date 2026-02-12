'use client';

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import { Job } from '@/lib/types';
import { parseDate } from '@/lib/utils';

interface JobCalendarProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function JobCalendar({ jobs, onJobClick }: JobCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const jobsByDate = useMemo(() => {
    const grouped = new Map<string, Job[]>();

    for (const job of jobs) {
      const endDate = parseDate(job.pbancEndYmd);

      if (Number.isNaN(endDate.getTime())) {
        continue;
      }

      const key = format(endDate, 'yyyy-MM-dd');
      const bucket = grouped.get(key);

      if (bucket) {
        bucket.push(job);
      } else {
        grouped.set(key, [job]);
      }
    }

    return grouped;
  }, [jobs]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedDateJobs = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return jobsByDate.get(selectedDateKey) ?? [];
  }, [jobsByDate, selectedDateKey]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) {
      return '';
    }

    return format(parseISO(selectedDateKey), 'M월 d일 (EEE)', { locale: ko });
  }, [selectedDateKey]);

  return (
    <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
          className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          이전
        </button>

        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCurrentMonth(startOfMonth(new Date()));
              setSelectedDateKey(null);
            }}
            className="rounded-lg border border-blue-200 dark:border-blue-700 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            다음
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((dayLabel) => (
          <div key={dayLabel} className="py-2 text-center text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
            {dayLabel}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {calendarDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayJobs = jobsByDate.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDateKey === key;
          const isTodayCell = isToday(day);

          return (
            <div
              key={key}
              className={`min-h-24 border-r border-b border-gray-200 dark:border-gray-700 p-2 ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'} ${isTodayCell ? 'bg-blue-50 dark:bg-blue-950/40' : ''} ${isSelected ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-inset' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`text-xs md:text-sm ${isTodayCell ? 'font-bold text-blue-700 dark:text-blue-300' : `font-medium ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}`}>
                  {format(day, 'd')}
                </div>
                {isToday(day) && (
                  <span className="text-[10px] rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5">
                    오늘
                  </span>
                )}
              </div>

              {dayJobs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(key)}
                  className="mt-2 inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-[11px] md:text-xs text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  마감 {dayJobs.length}건 보기
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedDateKey && selectedDateJobs.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
              {selectedDateLabel} 마감 공고
            </h4>
            <button
              type="button"
              onClick={() => setSelectedDateKey(null)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              닫기
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {selectedDateJobs.map((job) => (
              <button
                key={job.recrutPblntSn}
                type="button"
                onClick={() => onJobClick(job)}
                className="w-full text-left rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{job.recrutPbancTtl}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{job.instNm}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
