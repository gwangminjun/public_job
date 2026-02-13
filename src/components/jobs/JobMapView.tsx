'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, useEffect, useMemo, useState } from 'react';
import type { DivIcon, Icon } from 'leaflet';
import { Job } from '@/lib/types';
import { getDday, getDdayText } from '@/lib/utils';

interface JobMapViewProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  isLoading?: boolean;
}

type RegionPoint = {
  lat: number;
  lng: number;
};

type LeafletModule = typeof import('leaflet');
type MarkerPriority = 'urgent' | 'soon' | 'normal' | 'closed';

type MarkerWithPosition = {
  job: Job;
  region: string;
  position: [number, number];
  ddayText: string;
  markerPriority: MarkerPriority;
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
  강원특별자치도: '강원',
  세종특별자치시: '세종',
  충청남도: '충남',
  대전광역시: '대전',
  충청북도: '충북',
  경상북도: '경북',
  전라북도: '전북',
  전북특별자치도: '전북',
  대구광역시: '대구',
  울산광역시: '울산',
  경상남도: '경남',
  부산광역시: '부산',
  광주광역시: '광주',
  전라남도: '전남',
  제주특별자치도: '제주',
};

const DEFAULT_CENTER: [number, number] = [36.25, 127.9];
const DEFAULT_ZOOM = 7;
const LEAFLET_MARKER_ASSET = {
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
} as const;

type MapContainerProps = {
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  className?: string;
  children?: ReactNode;
};

type TileLayerProps = {
  attribution: string;
  url: string;
};

type MarkerProps = {
  position: [number, number];
  icon?: Icon | DivIcon;
  eventHandlers?: {
    click?: () => void;
  };
  children?: ReactNode;
};

type PopupProps = {
  children?: ReactNode;
};

type MarkerClusterGroupProps = {
  chunkedLoading?: boolean;
  iconCreateFunction?: (cluster: { getChildCount: () => number }) => DivIcon;
  children?: ReactNode;
};

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer as ComponentType<MapContainerProps>),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer as ComponentType<TileLayerProps>),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker as ComponentType<MarkerProps>),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup as ComponentType<PopupProps>),
  { ssr: false }
);

const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster').then((mod) => mod.default as ComponentType<MarkerClusterGroupProps>),
  { ssr: false }
);

function formatClusterCount(count: number): string {
  if (count >= 1000) {
    return '999+';
  }

  return count.toString();
}

function createClusterIcon(
  cluster: { getChildCount: () => number },
  leaflet: LeafletModule
): DivIcon {
  const count = cluster.getChildCount();
  const tier = count < 10 ? 'sm' : count < 30 ? 'md' : count < 80 ? 'lg' : 'xl';
  const sizeByTier: Record<typeof tier, number> = {
    sm: 34,
    md: 44,
    lg: 56,
    xl: 68,
  };
  const countLabel = formatClusterCount(count);

  return leaflet.divIcon({
    html: `
      <span class="job-cluster-shell">
        <span class="job-cluster-core">
          <strong class="job-cluster-count">${countLabel}</strong>
          <span class="job-cluster-unit">공고</span>
        </span>
      </span>
    `,
    className: `job-cluster-icon job-cluster-icon--${tier}`,
    iconSize: [sizeByTier[tier], sizeByTier[tier]],
  });
}

function getMarkerPriority(dday: number): MarkerPriority {
  if (dday < 0) {
    return 'closed';
  }

  if (dday <= 3) {
    return 'urgent';
  }

  if (dday <= 10) {
    return 'soon';
  }

  return 'normal';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createJobMarkerIcon(
  leaflet: LeafletModule,
  ddayText: string,
  priority: MarkerPriority,
  isActive: boolean
): DivIcon {
  const activeClass = isActive ? 'is-active' : '';

  return leaflet.divIcon({
    html: `<span class="job-marker-core"><span class="job-marker-label">${escapeHtml(ddayText)}</span></span>`,
    className: `job-marker-icon job-marker-icon--${priority} ${activeClass}`,
    iconSize: [46, 58],
    iconAnchor: [23, 54],
    popupAnchor: [0, -48],
  });
}

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

function buildJobPosition(base: RegionPoint, index: number, jobId: number): [number, number] {
  const angle = ((index + (jobId % 7)) * 37) % 360;
  const radians = (angle * Math.PI) / 180;
  const ring = 0.03 + ((index % 5) * 0.015);
  const lat = base.lat + Math.sin(radians) * ring;
  const lng = base.lng + Math.cos(radians) * ring;
  return [lat, lng];
}

export function JobMapView({ jobs, onJobClick, isLoading = false }: JobMapViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);

  useEffect(() => {
    let mounted = true;

    import('leaflet')
      .then((module) => {
        if (!mounted) {
          return;
        }

        module.Icon.Default.mergeOptions(LEAFLET_MARKER_ASSET);
        setLeaflet(module);
      })
      .catch(() => {
        // Keep map interactive even if icon setup fails.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const clusterIconCreateFunction = useMemo(
    () => (leaflet ? (cluster: { getChildCount: () => number }) => createClusterIcon(cluster, leaflet) : undefined),
    [leaflet]
  );

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
      .map(([region, regionJobs]) => ({ region, jobs: regionJobs, count: regionJobs.length }))
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  const jobsWithPosition = useMemo<MarkerWithPosition[]>(() => {
    return regionBuckets.flatMap((bucket) => {
      const point = REGION_POINTS[bucket.region] || REGION_POINTS.해외;

      return bucket.jobs.map((job, index) => {
        const dday = getDday(job.pbancEndYmd);

        return {
          job,
          region: bucket.region,
          position: buildJobPosition(point, index, job.recrutPblntSn),
          ddayText: getDdayText(job.pbancEndYmd),
          markerPriority: getMarkerPriority(dday),
        };
      });
    });
  }, [regionBuckets]);

  const activeRegion = selectedRegion || regionBuckets[0]?.region || '';
  const activeRegionJobs = jobsWithPosition.filter((item) => item.region === activeRegion);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
        <p className="text-base font-medium text-gray-900 dark:text-white">지도 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

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
        <p className="text-xs text-gray-500 dark:text-gray-400">
          전체 채용 {jobs.length.toLocaleString()}건을 표시하며 개별 공고 마커를 확인할 수 있습니다.
        </p>
      </div>

      <div className="h-[500px] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {leaflet && clusterIconCreateFunction && (
            <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIconCreateFunction}>
              {jobsWithPosition.map(({ job, region, position, ddayText, markerPriority }) => {
                const isActiveRegion = region === activeRegion;
                const markerIcon = createJobMarkerIcon(leaflet, ddayText, markerPriority, isActiveRegion);

                return (
                  <Marker
                    key={job.recrutPblntSn}
                    position={position}
                    icon={markerIcon}
                    eventHandlers={{ click: () => setSelectedRegion(region) }}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <p className="text-xs text-blue-600 font-medium mb-1">{region}</p>
                        <p className="text-sm font-semibold mb-1">{job.recrutPbancTtl}</p>
                        <p className="text-xs text-gray-600 mb-2">{job.instNm}</p>
                        <p className="text-xs text-gray-500 mb-3">{ddayText}</p>
                        <button
                          type="button"
                          onClick={() => onJobClick(job)}
                          className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                        >
                          상세 보기
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}
        </MapContainer>
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

      {activeRegionJobs.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 p-4">
          <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3">{activeRegion} 공고 목록</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activeRegionJobs.map(({ job }) => (
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
