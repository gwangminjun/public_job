'use client';

import { Job } from '@/lib/types';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useMounted } from '@/hooks/useMounted';
import {
  getDday,
  getDdayText,
  formatDate,
  isEndingSoon,
  isNewJob,
  truncate,
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface JobCardProps {
  job: Job;
  onClick: (job: Job) => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const mounted = useMounted();
  const { isBookmarked, toggleBookmark } = useBookmarkStore();

  const bookmarked = mounted ? isBookmarked(job.recrutPblntSn) : false;
  const dday = getDday(job.pbancEndYmd);
  const ddayText = getDdayText(job.pbancEndYmd);
  const endingSoon = isEndingSoon(job.pbancEndYmd);
  const isNew = isNewJob(job.pbancBgngYmd);
  const isExpired = dday < 0;

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(job);
  };

  return (
    <article
      onClick={() => onClick(job)}
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 cursor-pointer
        transition-all duration-200 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 hover:-translate-y-1
        ${isExpired ? 'opacity-60' : ''}`}
    >
      {/* 북마크 버튼 (우측 상단 절대 위치) */}
      <button
        onClick={handleBookmark}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        title={bookmarked ? "북마크 해제" : "북마크 추가"}
      >
        <svg
          className={`w-6 h-6 transition-colors ${
            bookmarked ? 'text-red-500 fill-current' : 'text-gray-400 dark:text-gray-500'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* 상단: D-day & 상태 뱃지 */}
      <div className="flex items-start justify-between mb-3 pr-10">
        <div className="flex gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold
              ${isExpired ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' :
                endingSoon ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'}`}
          >
            {ddayText}
          </span>
          {isNew && !isExpired && (
            <Badge variant="success">NEW</Badge>
          )}
          {job.ongoingYn === 'Y' && (
            <Badge variant="info">진행중</Badge>
          )}
        </div>
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 pr-8">
        {truncate(job.recrutPbancTtl, 50)}
      </h3>


      {/* 기관명 */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{job.instNm}</p>

      {/* 상세 정보 */}
      <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{job.workRgnNmLst || '지역 미정'}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{job.recrutNope}명</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {job.hireTypeNmLst && (
            <Badge className="text-xs">{job.hireTypeNmLst}</Badge>
          )}
          {job.recrutSeNm && (
            <Badge className="text-xs">{job.recrutSeNm}</Badge>
          )}
        </div>
      </div>

      {/* 하단: 기간 */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
        <span>공고기간: {formatDate(job.pbancBgngYmd)} ~ {formatDate(job.pbancEndYmd)}</span>
      </div>
    </article>
  );
}
