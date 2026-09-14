'use client';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { diaryFetch } from '@/lib/diary/client';
import { DiaryEntry } from '@/lib/diary/types';

async function fetchEntries(): Promise<DiaryEntry[]> {
  const res = await diaryFetch('/api/diary/entries');
  if (!res.ok) throw new Error('일기 목록을 불러오지 못했습니다.');
  const data = await res.json();
  return data.entries;
}

export function DiaryTimeline() {
  const { data: entries, isLoading, error } = useQuery({ queryKey: ['diary', 'entries'], queryFn: fetchEntries });

  if (isLoading) return <p className="text-center text-gray-400 py-12">불러오는 중...</p>;
  if (error) return <p className="text-center text-red-500 py-12">{(error as Error).message}</p>;
  if (!entries?.length) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p className="text-3xl mb-2">📖</p>
        <p>아직 쓴 일기가 없어요. 첫 일기를 남겨보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/diary/${entry.id}`}
          className="block rounded-xl bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-rose-500">
              {format(parseISO(entry.entryDate), 'M월 d일 (EEE)', { locale: ko })}
            </span>
            <span className="text-xs text-gray-400">{entry.authorName}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {entry.mood ? `${entry.mood} ` : ''}
            {entry.content}
          </p>
          {entry.photoUrls.length > 0 && (
            <div className="flex gap-2 mt-2">
              {entry.photoUrls.slice(0, 3).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
