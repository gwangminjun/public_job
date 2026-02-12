'use client';

import { useMemo, useState } from 'react';
import { Job } from '@/lib/types';

interface JobMapViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

type RegionPoint = {
  x: number;
  y: number;
};

const REGION_POINTS: Record<string, RegionPoint> = {
  서울: { x: 44, y: 20 },
  인천: { x: 36, y: 22 },
  경기: { x: 44, y: 29 },
  강원: { x: 62, y: 24 },
  세종: { x: 44, y: 40 },
  충남: { x: 34, y: 42 },
  대전: { x: 46, y: 46 },
  충북: { x: 54, y: 43 },
  경북: { x: 67, y: 50 },
  전북: { x: 39, y: 56 },
  대구: { x: 60, y: 58 },
  울산: { x: 73, y: 66 },
  경남: { x: 57, y: 69 },
  부산: { x: 67, y: 73 },
  광주: { x: 31, y: 69 },
  전남: { x: 29, y: 79 },
  제주: { x: 26, y: 93 },
  해외: { x: 83, y: 20 },
};

const REGION_ALIASES: Record<string, string> = {
  서울특별시: '서울',
  인천광역시: '인천',
  경기도: '경기',
  강원도: '강원',
  세종특별자치시: '세종',
  충청남도: '충남',
  대전광역시: '대전',
  충청북도: '충북',
  경상북도: '경북',
  전라북도: '전북',
  대구광역시: '대구',
  울산광역시: '울산',
  경상남도: '경남',
  부산광역시: '부산',
  광주광역시: '광주',
  전라남도: '전남',
  제주특별자치도: '제주',
};

function normalizeRegion(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '해외';
  }

  if (REGION_POINTS[trimmed]) {
    return trimmed;
  }

  if (REGION_ALIASES[trimmed]) {
    return REGION_ALIASES[trimmed];
  }

  for (const region of Object.keys(REGION_POINTS)) {
    if (trimmed.includes(region)) {
      return region;
    }
  }

  return '해외';
}

function getPrimaryRegion(workRegionText: string): string {
  const firstRegion = workRegionText.split(',')[0] || workRegionText;
  return normalizeRegion(firstRegion);
}

export function JobMapView({ jobs, onJobClick }: JobMapViewProps) {
  const regionBuckets = useMemo(() => {
    const buckets = new Map<string, Job[]>();

    for (const job of jobs) {
      const region = getPrimaryRegion(job.workRgnNmLst || '해외');
      const existing = buckets.get(region);
      if (existing) {
        existing.push(job);
      } else {
        buckets.set(region, [job]);
      }
    }

    return Array.from(buckets.entries())
      .map(([region, regionJobs]) => ({ region, jobs: regionJobs, count: regionJobs.length, point: REGION_POINTS[region] }))
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const activeRegion = selectedRegion || regionBuckets[0]?.region || '';
  const activeJobs = regionBuckets.find((bucket) => bucket.region === activeRegion)?.jobs || [];

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
        <p className="text-base font-medium text-gray-900 dark:text-white">지도에 표시할 공고가 없습니다.</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">검색 조건을 조정하거나 다른 페이지를 확인해보세요.</p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm transition-colors duration-300">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">지역별 채용 지도</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">마커 크기는 지역별 공고 수를 의미합니다.</p>
      </div>

      <div className="relative h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.45),transparent_35%)]" />

        {regionBuckets.map((bucket) => {
          const markerSize = Math.min(44, 22 + bucket.count * 2);
          const isActive = bucket.region === activeRegion;

          return (
            <button
              key={bucket.region}
              type="button"
              onClick={() => setSelectedRegion(bucket.region)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${isActive ? 'bg-blue-600 border-blue-200 text-white scale-110 shadow-lg' : 'bg-white/95 dark:bg-slate-700 border-blue-300 dark:border-slate-500 text-blue-700 dark:text-blue-200 hover:scale-105'}`}
              style={{ left: `${bucket.point.x}%`, top: `${bucket.point.y}%`, width: `${markerSize}px`, height: `${markerSize}px` }}
              title={`${bucket.region} ${bucket.count}건`}
            >
              <span>{bucket.region}</span>
              <span>{bucket.count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {regionBuckets.map((bucket) => {
          const isActive = bucket.region === activeRegion;
          return (
            <button
              key={bucket.region}
              type="button"
              onClick={() => setSelectedRegion(bucket.region)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {bucket.region} ({bucket.count})
            </button>
          );
        })}
      </div>

      {activeJobs.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4">
          <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3">{activeRegion} 공고 목록</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activeJobs.map((job) => (
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
