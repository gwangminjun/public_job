'use client';

import { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchFilter } from '@/components/layout/SearchFilter';
import { UrlFilterSync } from '@/components/layout/UrlFilterSync';
import { Footer } from '@/components/layout/Footer';
import { StatsPanel, StatType } from '@/components/stats/StatsPanel';
import { JobTrendDashboard } from '@/components/stats/JobTrendDashboard';
import { JobList } from '@/components/jobs/JobList';
import { JobCalendar } from '@/components/jobs/JobCalendar';
import { JobMapView } from '@/components/jobs/JobMapView';
import { JobModal } from '@/components/jobs/JobModal';
import { Pagination } from '@/components/ui/Pagination';
import { useJobs } from '@/hooks/useJobs';
import { useMapJobs } from '@/hooks/useMapJobs';
import { useFilterStore } from '@/store/filterStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useRecentViewedStore } from '@/store/recentViewedStore';
import { Job } from '@/lib/types';
import { formatRecentViewedAt } from '@/lib/utils';

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'map' | 'insight'>('list');
  const [activeStatFilter, setActiveStatFilter] = useState<StatType | null>(null);
  const [showPresetPanel, setShowPresetPanel] = useState(false);

  const { data, isLoading, error } = useJobs(activeStatFilter || '');
  const { data: mapData, isLoading: isMapLoading } = useMapJobs(activeStatFilter || '');

  const { page, limit, setPage } = useFilterStore();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const recentJobs = useRecentViewedStore((state) => state.recentJobs);
  const addRecent = useRecentViewedStore((state) => state.addRecent);

  const stats = useMemo(() => {
    if (!data?.stats) {
      return { totalCount: 0, endingSoon: 0, newJobs: 0, institutions: 0 };
    }
    return data.stats;
  }, [data?.stats]);

  const handleStatClick = useCallback(
    (type: StatType) => {
      if (activeStatFilter === type || type === 'total') {
        setActiveStatFilter(null);
      } else {
        setActiveStatFilter(type);

        if (type === 'institutions') {
          setViewMode('list');
        }
      }

      setPage(1);
    },
    [activeStatFilter, setPage]
  );

  const totalPages = Math.ceil((data?.totalCount || 0) / limit);
  const latestRecentJobs = useMemo(() => recentJobs.slice(0, 5), [recentJobs]);

  const handleJobClick = useCallback(
    (job: Job) => {
      addRecent(job);
      setSelectedJob(job);
    },
    [addRecent]
  );

  let mainContent: ReactNode;

  if (viewMode === 'list') {
    mainContent = (
      <JobList
        jobs={data?.result || []}
        isLoading={isLoading}
        onJobClick={handleJobClick}
        activeStatFilter={activeStatFilter}
      />
    );
  } else if (viewMode === 'calendar') {
    mainContent =
      bookmarks.length > 0 ? (
        <JobCalendar jobs={bookmarks} onJobClick={handleJobClick} />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
          <p className="text-base font-medium text-gray-900 dark:text-white">캘린더에 표시할 즐겨찾기 공고가 없습니다.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            리스트에서 하트 버튼을 눌러 공고를 추가하면 캘린더에서 마감일 기준으로 모아볼 수 있습니다.
          </p>
        </div>
      );
  } else if (viewMode === 'map') {
    mainContent = (
      <JobMapView jobs={mapData?.result || []} isLoading={isMapLoading} onJobClick={handleJobClick} />
    );
  } else {
    mainContent = (
      <JobTrendDashboard jobs={mapData?.result || []} isLoading={isMapLoading} onJobClick={handleJobClick} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Suspense fallback={null}>
        <UrlFilterSync />
      </Suspense>

      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <section className="relative overflow-hidden rounded-2xl border border-blue-100/70 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 p-5 md:p-7 mb-6">
          <div className="pointer-events-none absolute -top-14 -right-12 h-44 w-44 rounded-full bg-blue-300/20 blur-2xl dark:bg-blue-500/20" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-indigo-300/20 blur-2xl dark:bg-indigo-500/20" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full bg-blue-600 text-white px-3 py-1 text-xs font-semibold shadow-sm">
                공공기관 채용 대시보드
              </p>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                원하는 채용 공고를 더 빠르게 찾으세요
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
                검색 · 필터 · 지도 · 트렌드 분석까지 한 화면에서 탐색할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
              <div className="rounded-lg border border-white/70 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                실시간 공고
              </div>
              <div className="rounded-lg border border-white/70 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                지역 지도
              </div>
              <div className="rounded-lg border border-white/70 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                트렌드 분석
              </div>
            </div>
          </div>
        </section>

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

        <div className="mb-6">
          <SearchFilter
            showPresetPanel={showPresetPanel}
            isPresetPanelVisible={showPresetPanel}
            onTogglePresetPanel={() => setShowPresetPanel((prev) => !prev)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        )}

        {!isLoading && data && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                총 <span className="font-semibold text-gray-900 dark:text-white">{data.totalCount?.toLocaleString()}</span>개의 채용공고
              </p>

              {activeStatFilter === 'institutions' && (
                <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 text-xs font-medium">
                  기관별 모아보기 적용됨
                </span>
              )}

              {viewMode === 'calendar' && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-xs font-medium">
                  캘린더는 즐겨찾기 공고만 표시 ({bookmarks.length}건)
                </span>
              )}

              {viewMode === 'map' && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-xs font-medium">
                  지도 뷰는 현재 필터 기준 전체 공고({mapData?.totalCount?.toLocaleString() || 0}건)로 표시됩니다
                </span>
              )}

              {viewMode === 'insight' && (
                <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-xs font-medium">
                  분석 뷰는 현재 필터 기준 전체 공고({mapData?.totalCount?.toLocaleString() || 0}건)를 집계합니다
                </span>
              )}
            </div>

            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                목록
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                캘린더
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                지도
              </button>
              <button
                type="button"
                onClick={() => setViewMode('insight')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'insight' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                분석
              </button>
            </div>
          </div>
        )}

        {mainContent}

        {!isLoading && viewMode === 'list' && totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        <section className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 transition-colors duration-300">
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
      </main>

      <Footer />

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
