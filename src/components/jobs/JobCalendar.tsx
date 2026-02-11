'use client';

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
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

  return (
    <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
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

        <button
          type="button"
          onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          다음
        </button>
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

          return (
            <div
              key={key}
              className={`min-h-28 border-r border-b border-gray-200 dark:border-gray-700 p-2 ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}`}
            >
              <div className={`mb-1 text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayJobs.slice(0, 2).map((job) => (
                  <button
                    key={job.recrutPblntSn}
                    type="button"
                    onClick={() => onJobClick(job)}
                    className="w-full text-left rounded-md bg-blue-50 dark:bg-blue-900/30 px-1.5 py-1 text-[11px] md:text-xs text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors line-clamp-2"
                    title={job.recrutPbancTtl}
                  >
                    {job.recrutPbancTtl}
                  </button>
                ))}

                {dayJobs.length > 2 && (
                  <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
                    +{dayJobs.length - 2}건 더 있음
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
