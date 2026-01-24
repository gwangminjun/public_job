'use client';

import { Job } from '@/lib/types';
import { JobCard } from './JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  onJobClick: (job: Job) => void;
}

export function JobList({ jobs, isLoading, onJobClick }: JobListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-16 w-16 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-4 text-lg text-gray-500">검색 결과가 없습니다</p>
        <p className="mt-2 text-sm text-gray-400">다른 검색어나 필터를 사용해 보세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <JobCard
          key={job.recrutPblntSn}
          job={job}
          onClick={onJobClick}
        />
      ))}
    </div>
  );
}
