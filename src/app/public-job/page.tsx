'use client';

import { ReactNode, Suspense, useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { SearchFilter } from '@/components/layout/SearchFilter';
import { UrlFilterSync } from '@/components/layout/UrlFilterSync';
import { Footer } from '@/components/layout/Footer';
import { StatsPanel, StatType } from '@/components/stats/StatsPanel';
import { JobList } from '@/components/jobs/JobList';
import { JobModal } from '@/components/jobs/JobModal';
import { Pagination } from '@/components/ui/Pagination';
import { useJobs } from '@/hooks/useJobs';
import { useMapJobs } from '@/hooks/useMapJobs';
import { useFilterStore } from '@/store/filterStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useRecentViewedStore } from '@/store/recentViewedStore';
import { Job } from '@/lib/types';
import { formatRecentViewedAt } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const JobCalendar = dynamic(
  () => import('@/components/jobs/JobCalendar').then((mod) => mod.JobCalendar),
  { loading: () => <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center text-sm text-gray-500 dark:text-gray-400">캘린더 로딩 중...</div> }
);

const JobMapView = dynamic(
  () => import('@/components/jobs/JobMapView').then((mod) => mod.JobMapView),
  { ssr: false, loading: () => <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center text-sm text-gray-500 dark:text-gray-400">지도 로딩 중...</div> }
);

const JobTrendDashboard = dynamic(
  () => import('@/components/stats/JobTrendDashboard').then((mod) => mod.JobTrendDashboard),
  { loading: () => <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center text-sm text-gray-500 dark:text-gray-400">분석 패널 로딩 중...</div> }
);

export default function Home() {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'map' | 'insight'>('list');
  const [activeStatFilter, setActiveStatFilter] = useState<StatType | null>(null);
  const [showPresetPanel, setShowPresetPanel] = useState(false);

  const { data, isLoading, error } = useJobs(activeStatFilter || '');
  const needsMapDataset = viewMode === 'map' || viewMode === 'insight';
  const { data: mapData, isLoading: isMapLoading } = useMapJobs(activeStatFilter || '', needsMapDataset);

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
          <p className="text-base font-medium text-gray-900 dark:text-white">{t('home.calendarEmptyTitle')}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('home.calendarEmptyDesc')}
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
                {t('home.heroBadge')}
              </p>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('home.heroTitle')}
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
                {t('home.heroDesc')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
              <div className="rounded-lg border border-white/70 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                {t('home.cardRealtime')}
              </div>
              <div className="rounded-lg border border-white/70 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                {t('home.cardMap')}
              </div>
              <div className="rounded-lg border border-white/70 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 px-3 py-2 text-center text-gray-700 dark:text-gray-200">
                {t('home.cardTrend')}
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
            {t('home.loadError')}
          </div>
        )}

        {!isLoading && data && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('home.totalJobs', { count: data.totalCount || 0 })}
              </p>

              {activeStatFilter === 'institutions' && (
                <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 text-xs font-medium">
                  {t('home.institutionGrouping')}
                </span>
              )}

              {viewMode === 'calendar' && (
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-xs font-medium">
                  {t('home.calendarBookmarkOnly', { count: bookmarks.length })}
                </span>
              )}

              {viewMode === 'map' && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-xs font-medium">
                  {t('home.mapUsesAll', { count: mapData?.totalCount || 0 })}
                </span>
              )}

              {viewMode === 'insight' && (
                <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-xs font-medium">
                  {t('home.insightUsesAll', { count: mapData?.totalCount || 0 })}
                </span>
              )}
            </div>

            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {t('home.viewList')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {t('home.viewCalendar')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {t('home.viewMap')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('insight')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${viewMode === 'insight' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {t('home.viewInsight')}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('home.recentTitle')}</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('home.recentCap')}</span>
          </div>

          {latestRecentJobs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('home.recentEmpty')}</p>
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
                    <span className="shrink-0">{t('home.viewedAt', { time: formatRecentViewedAt(viewedAt) })}</span>
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
