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

  if (isLoading) return <p className="text-center diary-muted py-12">불러오는 중...</p>;
  if (error) return <p className="text-center diary-accent py-12">{(error as Error).message}</p>;
  if (!entries?.length) {
    return (
      <div className="diary-card text-center diary-muted py-16">
        <p className="text-3xl mb-2">📖</p>
        <p>아직 쓴 일기가 없어요. 첫 일기를 남겨보세요!</p>
        <Link href="/diary/write" className="diary-primary inline-flex items-center px-5 mt-6">첫 일기 쓰기</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/diary/${entry.id}`}
          className="diary-card diary-entry block"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
            <time dateTime={entry.entryDate} className="text-base sm:text-lg font-semibold diary-accent">
              {format(parseISO(entry.entryDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
            </time>
            <span className="diary-author text-sm break-all">{entry.authorName}</span>
          </div>
          <p className="text-base leading-7 break-words line-clamp-3">
            {entry.mood ? `${entry.mood} ` : ''}
            {entry.content}
          </p>
          {entry.photoUrls.length > 0 && (
            <div className="flex gap-3 mt-5">
              {entry.photoUrls.slice(0, 3).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
