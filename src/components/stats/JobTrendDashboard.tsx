'use client';

import { useMemo, useState } from 'react';
import { Job } from '@/lib/types';
import { formatDate, getDday, getDdayText } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface JobTrendDashboardProps {
  jobs: Job[];
  isLoading?: boolean;
  onJobClick: (job: Job) => void;
}

type TrendDatum = {
  label: string;
  count: number;
};

type TrendTone = 'blue' | 'emerald' | 'amber';

type TrendCardProps = {
  title: string;
  description: string;
  data: TrendDatum[];
  tone: TrendTone;
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

const toneStyles: Record<TrendTone, { fill: string; text: string; chip: string }> = {
  blue: {
    fill: 'from-blue-500 to-blue-600',
    text: 'text-blue-700 dark:text-blue-300',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  emerald: {
    fill: 'from-emerald-500 to-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-300',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  amber: {
    fill: 'from-amber-500 to-orange-600',
    text: 'text-amber-700 dark:text-amber-300',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
};

function safeDday(dateText: string): number {
  const value = getDday(dateText);
  if (!Number.isFinite(value)) {
    return 9999;
  }

  return value;
}

function safeDdayText(dateText: string): string {
  const value = safeDday(dateText);
  if (value === 9999) {
    return '-';
  }

  return getDdayText(dateText);
}

function safeFormatDate(dateText: string): string {
  if (!/^\d{8}$/.test(dateText || '')) {
    return '-';
  }

  try {
    return formatDate(dateText);
  } catch {
    return '-';
  }
}

function normalizeRegion(regionText: string): string {
  const firstRegion = regionText.split(',')[0]?.trim() || '';
  if (!firstRegion) {
    return '기타';
  }

  if (REGION_ALIASES[firstRegion]) {
    return REGION_ALIASES[firstRegion];
  }

  for (const alias of Object.keys(REGION_ALIASES)) {
    if (firstRegion.includes(alias)) {
      return REGION_ALIASES[alias];
    }
  }

  return firstRegion;
}

function pickPrimaryLabel(value: string, fallback = '기타'): string {
  const first = value
    .split(/[,\n/]/)
    .map((item) => item.trim())
    .find(Boolean);
  return first || fallback;
}

function countByLabel(jobs: Job[], picker: (job: Job) => string, limit = 6): TrendDatum[] {
  const counts = new Map<string, number>();

  for (const job of jobs) {
    const label = picker(job);
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function buildMonthlyTrend(jobs: Job[], limit = 6): TrendDatum[] {
  const counts = new Map<string, number>();

  for (const job of jobs) {
    if (!/^\d{8}$/.test(job.pbancBgngYmd || '')) {
      continue;
    }

    const key = job.pbancBgngYmd.slice(0, 6);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-limit)
    .map(([key, count]) => ({
      label: `${key.slice(2, 4)}.${key.slice(4, 6)}`,
      count,
    }));
}

function extractSalaryHint(job: Job): string {
  const source = `${job.prefCondCn || ''} ${job.aplyQlfcCn || ''}`.trim();
  const matched = source.match(/(연봉|월급|시급|급여)[^,\n]*/);

  if (matched?.[0]) {
    return matched[0].slice(0, 36);
  }

  return '공공 API 급여 정보 미제공';
}

function TrendCard({ title, description, data, tone }: TrendCardProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const style = toneStyles[tone];

  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${style.chip}`}>TOP</span>
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{description}</p>

      {data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
          표시할 데이터가 없습니다.
        </p>
      ) : (
        <div className="space-y-2.5">
          {data.map((item) => {
            const ratio = (item.count / maxCount) * 100;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className={`shrink-0 font-semibold ${style.text}`}>{item.count.toLocaleString()}건</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.fill}`}
                    style={{ width: `${Math.max(9, ratio)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function JobTrendDashboard({ jobs, isLoading = false, onJobClick }: JobTrendDashboardProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const availableIds = useMemo(() => new Set(jobs.map((job) => job.recrutPblntSn)), [jobs]);

  const regionTrend = useMemo(
    () => countByLabel(jobs, (job) => normalizeRegion(job.workRgnNmLst || ''), 8),
    [jobs]
  );

  const recruitTypeTrend = useMemo(
    () => countByLabel(jobs, (job) => pickPrimaryLabel(job.recrutSeNm, '채용구분 미정'), 6),
    [jobs]
  );

  const monthlyTrend = useMemo(() => buildMonthlyTrend(jobs, 6), [jobs]);

  const compareCandidates = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const ddayA = safeDday(a.pbancEndYmd);
        const ddayB = safeDday(b.pbancEndYmd);
        const normalizedA = ddayA < 0 ? 9998 : ddayA;
        const normalizedB = ddayB < 0 ? 9998 : ddayB;

        if (normalizedA !== normalizedB) {
          return normalizedA - normalizedB;
        }

        return (b.pbancBgngYmd || '').localeCompare(a.pbancBgngYmd || '');
      })
      .slice(0, 36);
  }, [jobs]);

  const selectedJobs = useMemo(() => {
    const selectedById = new Map(jobs.map((job) => [job.recrutPblntSn, job] as const));
    return selectedIds
      .map((id) => selectedById.get(id))
      .filter((job): job is Job => Boolean(job));
  }, [jobs, selectedIds]);

  const selectedJobIdSet = useMemo(
    () => new Set(selectedJobs.map((job) => job.recrutPblntSn)),
    [selectedJobs]
  );

  const toggleCompareTarget = (jobId: number) => {
    setSelectedIds((prev) => {
      const cleaned = prev.filter((id) => availableIds.has(id)).slice(0, 3);

      if (cleaned.includes(jobId)) {
        return cleaned.filter((id) => id !== jobId);
      }

      if (cleaned.length >= 3) {
        return cleaned;
      }

      return [...cleaned, jobId];
    });
  };

  const pickRecommendedTargets = () => {
    setSelectedIds(compareCandidates.slice(0, 3).map((job) => job.recrutPblntSn));
  };

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
        <p className="text-base font-medium text-gray-900 dark:text-white">분석 데이터를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
        <p className="text-base font-medium text-gray-900 dark:text-white">분석할 공고 데이터가 없습니다.</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">검색 조건을 조정한 뒤 다시 확인해 주세요.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">채용 트렌드 대시보드</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            현재 필터 기준 {jobs.length.toLocaleString()}건을 집계해 지역/채용구분/기간 흐름을 보여줍니다.
          </p>
        </div>
        <Badge variant="info">10주차 기능</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TrendCard
          title="지역 분포"
          description="근무지역 상위 분포"
          data={regionTrend}
          tone="blue"
        />
        <TrendCard
          title="채용구분 분포"
          description="신입/경력 등 채용 유형 분포"
          data={recruitTypeTrend}
          tone="emerald"
        />
        <TrendCard
          title="월별 공고 추이"
          description="공고 시작일 기준 최근 월별 건수"
          data={monthlyTrend}
          tone="amber"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-4">
        <article className="xl:col-span-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">비교 대상 선택</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{selectedJobs.length}/3 선택</span>
              <button
                type="button"
                onClick={pickRecommendedTargets}
                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              >
                추천 3개
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {compareCandidates.map((job) => {
              const isSelected = selectedJobIdSet.has(job.recrutPblntSn);
              const isDisabled = !isSelected && selectedJobs.length >= 3;
              return (
                <button
                  key={job.recrutPblntSn}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => toggleCompareTarget(job.recrutPblntSn)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{job.recrutPbancTtl}</p>
                      <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-gray-900 dark:text-blue-300">
                      {safeDdayText(job.pbancEndYmd)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{job.instNm}</p>
                </button>
              );
            })}
          </div>
        </article>

        <article className="xl:col-span-7 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">공고 비교</h4>
            {selectedJobs.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                선택 초기화
              </button>
            )}
          </div>

          {selectedJobs.length < 2 ? (
            <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 py-12 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">비교하려면 2~3개 공고를 선택해 주세요.</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">기관, 지역, 채용구분, 자격요건, 급여정보 힌트를 한 화면에서 비교합니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="grid min-w-[760px] gap-px rounded-lg bg-gray-200 dark:bg-gray-700"
                style={{ gridTemplateColumns: `160px repeat(${selectedJobs.length}, minmax(0, 1fr))` }}
              >
                <div className="bg-gray-100 dark:bg-gray-900 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">항목</div>
                {selectedJobs.map((job) => (
                  <div key={`header-${job.recrutPblntSn}`} className="bg-gray-100 dark:bg-gray-900 px-3 py-2">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{job.recrutPbancTtl}</p>
                    <button
                      type="button"
                      onClick={() => onJobClick(job)}
                      className="mt-1 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      상세 보기
                    </button>
                  </div>
                ))}

                {[
                  {
                    label: '기관',
                    render: (job: Job) => job.instNm || '-',
                  },
                  {
                    label: '근무지역',
                    render: (job: Job) => job.workRgnNmLst || '-',
                  },
                  {
                    label: '채용구분',
                    render: (job: Job) => job.recrutSeNm || '-',
                  },
                  {
                    label: '고용형태',
                    render: (job: Job) => job.hireTypeNmLst || '-',
                  },
                  {
                    label: '모집인원',
                    render: (job: Job) => `${(job.recrutNope || 0).toLocaleString()}명`,
                  },
                  {
                    label: '접수기간',
                    render: (job: Job) => `${safeFormatDate(job.pbancBgngYmd)} ~ ${safeFormatDate(job.pbancEndYmd)}`,
                  },
                  {
                    label: '마감정보',
                    render: (job: Job) => safeDdayText(job.pbancEndYmd),
                  },
                  {
                    label: '학력요건',
                    render: (job: Job) => job.acbgCondNmLst || '-',
                  },
                  {
                    label: '지원자격',
                    render: (job: Job) => job.aplyQlfcCn || '상세 공고문 참고',
                  },
                  {
                    label: '우대조건',
                    render: (job: Job) => job.prefCondCn || '상세 공고문 참고',
                  },
                  {
                    label: '급여정보',
                    render: (job: Job) => extractSalaryHint(job),
                  },
                ].map((row) => (
                  <div key={row.label} className="contents">
                    <div className="bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {row.label}
                    </div>
                    {selectedJobs.map((job) => (
                      <div
                        key={`${row.label}-${job.recrutPblntSn}`}
                        className="bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 break-words"
                      >
                        {row.render(job)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
