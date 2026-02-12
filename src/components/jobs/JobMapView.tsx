'use client';

import { useMemo, useState } from 'react';
import { Job } from '@/lib/types';
import { LeafletRegionMap } from './LeafletRegionMap';

interface JobMapViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export type RegionPoint = {
  lat: number;
  lng: number;
};

export type RegionBucket = {
  region: string;
  jobs: Job[];
  count: number;
  point: RegionPoint;
};

const REGION_POINTS: Record<string, RegionPoint> = {
  서울: { lat: 37.5665, lng: 126.978 },
  인천: { lat: 37.4563, lng: 126.7052 },
  경기: { lat: 37.4138, lng: 127.5183 },
  강원: { lat: 37.8228, lng: 128.1555 },
  세종: { lat: 36.48, lng: 127.289 },
  충남: { lat: 36.6588, lng: 126.6728 },
  대전: { lat: 36.3504, lng: 127.3845 },
  충북: { lat: 36.8, lng: 127.7 },
  경북: { lat: 36.4919, lng: 128.8889 },
  전북: { lat: 35.7175, lng: 127.153 },
  대구: { lat: 35.8714, lng: 128.6014 },
  울산: { lat: 35.5384, lng: 129.3114 },
  경남: { lat: 35.4606, lng: 128.2132 },
  부산: { lat: 35.1796, lng: 129.0756 },
  광주: { lat: 35.1595, lng: 126.8526 },
  전남: { lat: 34.8679, lng: 126.991 },
  제주: { lat: 33.4996, lng: 126.5312 },
  해외: { lat: 38.2, lng: 133.0 },
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
      .map(([region, regionJobs]) => ({
        region,
        jobs: regionJobs,
        count: regionJobs.length,
        point: REGION_POINTS[region],
      }))
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
        <p className="text-xs text-gray-500 dark:text-gray-400">원형 마커를 클릭하면 지역별 공고를 확인할 수 있습니다.</p>
      </div>

      <div className="h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <LeafletRegionMap
          regionBuckets={regionBuckets}
          activeRegion={activeRegion}
          onSelectRegion={setSelectedRegion}
        />
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
