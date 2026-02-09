'use client';

import { Suspense, useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchFilter } from '@/components/layout/SearchFilter';
import { UrlFilterSync } from '@/components/layout/UrlFilterSync';
import { Footer } from '@/components/layout/Footer';
import { StatsPanel } from '@/components/stats/StatsPanel';
import { JobList } from '@/components/jobs/JobList';
import { JobModal } from '@/components/jobs/JobModal';
import { Pagination } from '@/components/ui/Pagination';
import { useJobs } from '@/hooks/useJobs';
import { useFilterStore } from '@/store/filterStore';
import { Job } from '@/lib/types';
import { isEndingSoon, isNewJob } from '@/lib/utils';

export default function Home() {
  const { data, isLoading, error } = useJobs();
  const { page, limit, setPage } = useFilterStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // 통계 계산
  const stats = useMemo(() => {
    if (!data?.result) {
      return { totalCount: 0, endingSoon: 0, newJobs: 0, institutions: 0 };
    }

    const jobs = data.result;
    const endingSoon = jobs.filter((j) => isEndingSoon(j.pbancEndYmd)).length;
    const newJobs = jobs.filter((j) => isNewJob(j.pbancBgngYmd)).length;
    const institutions = new Set(jobs.map((j) => j.instNm)).size;

    return {
      totalCount: data.totalCount || jobs.length,
      endingSoon,
      newJobs,
      institutions,
    };
  }, [data]);

  const totalPages = Math.ceil((data?.totalCount || 0) / limit);

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <UrlFilterSync />
      </Suspense>

      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* 통계 패널 */}
        <div className="mb-6">
          <StatsPanel
            totalCount={stats.totalCount}
            endingSoon={stats.endingSoon}
            newJobs={stats.newJobs}
            institutions={stats.institutions}
          />
        </div>

        {/* 검색 & 필터 */}
        <div className="mb-6">
          <SearchFilter />
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {/* 결과 카운트 */}
        {!isLoading && data && (
          <p className="text-sm text-gray-500 mb-4">
            총 <span className="font-semibold text-gray-900">{data.totalCount?.toLocaleString()}</span>개의 채용공고
          </p>
        )}

        {/* 채용 목록 */}
        <JobList
          jobs={data?.result || []}
          isLoading={isLoading}
          onJobClick={setSelectedJob}
        />

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* 모달 */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
