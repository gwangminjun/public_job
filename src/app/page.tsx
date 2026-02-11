'use client';

import { Suspense, useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchFilter } from '@/components/layout/SearchFilter';
import { UrlFilterSync } from '@/components/layout/UrlFilterSync';
import { Footer } from '@/components/layout/Footer';
import { StatsPanel, StatType } from '@/components/stats/StatsPanel';
import { JobList } from '@/components/jobs/JobList';
import { JobModal } from '@/components/jobs/JobModal';
import { Pagination } from '@/components/ui/Pagination';
import { useJobs } from '@/hooks/useJobs';
import { useFilterStore } from '@/store/filterStore';
import { useRecentViewedStore } from '@/store/recentViewedStore';
import { Job } from '@/lib/types';
import { formatRecentViewedAt } from '@/lib/utils';

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeStatFilter, setActiveStatFilter] = useState<StatType | null>(null);
  const { data, isLoading, error } = useJobs(activeStatFilter || '');
  const { page, limit, setPage } = useFilterStore();
  const recentJobs = useRecentViewedStore((state) => state.recentJobs);
  const addRecent = useRecentViewedStore((state) => state.addRecent);

  // API에서 전체 기준 통계 사용
  const stats = useMemo(() => {
    if (!data?.stats) {
      return { totalCount: 0, endingSoon: 0, newJobs: 0, institutions: 0 };
    }
    return data.stats;
  }, [data?.stats]);

  const handleStatClick = useCallback((type: StatType) => {
    if (activeStatFilter === type || type === 'total') {
      setActiveStatFilter(null);
    } else {
      setActiveStatFilter(type);
    }
    setPage(1);
  }, [activeStatFilter, setPage]);

  const totalPages = Math.ceil((data?.totalCount || 0) / limit);
  const latestRecentJobs = useMemo(() => recentJobs.slice(0, 5), [recentJobs]);

  const handleJobClick = useCallback((job: Job) => {
    addRecent(job);
    setSelectedJob(job);
  }, [addRecent]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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
            activeStatFilter={activeStatFilter}
            onStatClick={handleStatClick}
          />
        </div>

        {/* 검색 & 필터 */}
        <div className="mb-6">
          <SearchFilter />
        </div>

        {/* 최근 본 공고 */}
        <section className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">최근 본 공고</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">최대 5개 표시</span>
          </div>

          {latestRecentJobs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">아직 열람한 공고가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {latestRecentJobs.map(({ job, viewedAt }) => (
                <button
                  key={job.recrutPblntSn}
                  onClick={() => handleJobClick(job)}
                  className="w-full text-left rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{job.recrutPbancTtl}</p>
                  <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="truncate">{job.instNm}</span>
                    <span className="shrink-0">열람 {formatRecentViewedAt(viewedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {/* 결과 카운트 */}
        {!isLoading && data && (
          <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
            총 <span className="font-semibold text-gray-900 dark:text-white">{data.totalCount?.toLocaleString()}</span>개의 채용공고
          </p>
        )}

        {/* 채용 목록 */}
        <JobList
          jobs={data?.result || []}
          isLoading={isLoading}
          onJobClick={handleJobClick}
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
