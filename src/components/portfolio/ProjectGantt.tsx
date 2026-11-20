import type { ProjectSpan } from '@/app/portfolio/portfolio-data';

type ProjectGanttProps = {
  spans: ProjectSpan[];
  /** Chart window, `YYYY-MM`; ongoing ranges run to `until`, which is also the "now" line. */
  from: string;
  until: string;
};

const LANES = [
  { key: 'gis', label: 'GIS·공간정보' },
  { key: 'data', label: '데이터 연계·업무 시스템' },
  { key: 'cctv', label: 'CCTV·영상관제' },
] as const;

/**
 * Project | duration | status | timeline. Below `sm` the duration and status columns fold into the
 * project cell; between `sm` and `min-w` the table scrolls sideways with the project column pinned.
 */
const ROW = 'grid grid-cols-[8.5rem_1fr] sm:grid-cols-[13rem_7rem_5.5rem_1fr]';
const WIDE = 'hidden sm:flex';
const PINNED = 'sticky left-0 z-10';
const CELL = 'flex flex-col justify-center px-3 py-2.5';

const toMonth = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  return year * 12 + month - 1;
};

const formatYm = (ym: string) => ym.replace('-', '.');

export function ProjectGantt({ spans, from, until }: ProjectGanttProps) {
  const start = toMonth(from);
  // Exclusive end, so a one-month project still has width.
  const end = toMonth(until) + 1;
  const pct = (month: number) => `${((month - start) / (end - start)) * 100}%`;
  const place = (left: number, right: number) => ({ left: pct(left), width: `calc(${pct(right)} - ${pct(left)})` });
  const rangeEnd = (range: ProjectSpan['ranges'][number]) => (range.end ? toMonth(range.end) + 1 : end);

  // One band per calendar year, clipped to the chart window.
  const firstYear = Number(from.slice(0, 4));
  const years = Array.from({ length: Number(until.slice(0, 4)) - firstYear + 1 }, (_, i) => {
    const year = firstYear + i;
    return { year, left: Math.max(year * 12, start), right: Math.min((year + 1) * 12, end) };
  });

  // Alternating year bands plus the "now" line, drawn behind every timeline cell.
  const background = (
    <>
      {years.map(
        (band, i) =>
          i % 2 === 1 && (
            <span key={band.year} className="absolute inset-y-0 bg-slate-100/60" style={place(band.left, band.right)} />
          ),
      )}
      <span className="absolute inset-y-0 right-0 border-r border-dashed border-violet-400" />
    </>
  );

  return (
    <figure className="mt-12 rounded-2xl border border-slate-200 bg-white">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 p-5 sm:px-8 sm:pt-8">
        <span className="text-lg font-black text-slate-950">프로젝트 수행 기간</span>
        <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-6 rounded-full bg-slate-300" />
            완료
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-6 rounded-full bg-violet-600" />
            진행 중
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="h-4 border-r border-dashed border-violet-400" />
            현재 ({formatYm(until)})
          </span>
        </span>
      </figcaption>

      <div className="overflow-x-auto rounded-b-2xl">
        <div className="text-sm sm:min-w-[46rem]">
          <div className={`${ROW} border-y border-slate-200 bg-white text-xs font-bold text-slate-500`}>
            <span className={`${PINNED} ${CELL} bg-white`}>프로젝트</span>
            <span className={`${WIDE} ${CELL}`}>기간</span>
            <span className={`${WIDE} ${CELL}`}>상태</span>
            <span aria-hidden="true" className="relative">
              {years.map((band) => (
                <span
                  key={band.year}
                  className="absolute inset-y-0 flex items-center justify-center border-l border-slate-200"
                  style={place(band.left, band.right)}
                >
                  {/* A clipped first or last year is labeled only if it has room. */}
                  {band.right - band.left >= 4 && (
                    <>
                      <span className="sm:hidden">&apos;{String(band.year).slice(2)}</span>
                      <span className="hidden sm:inline">{band.year}</span>
                    </>
                  )}
                </span>
              ))}
            </span>
          </div>

          {LANES.map((lane) => {
            const items = spans
              .filter((item) => item.lane === lane.key)
              .toSorted((a, b) => a.ranges[0].start.localeCompare(b.ranges[0].start));
            const ongoing = items.filter((item) => item.ranges.some((range) => range.end === null)).length;
            const laneStart = Math.min(...items.flatMap((item) => item.ranges.map((range) => toMonth(range.start))));
            const laneEnd = Math.max(...items.flatMap((item) => item.ranges.map(rangeEnd)));

            return (
              <details key={lane.key} open className="group border-b border-slate-200 last:border-b-0">
                <summary
                  className={`${ROW} cursor-pointer list-none bg-slate-50 font-bold text-slate-950 hover:bg-violet-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-600 [&::-webkit-details-marker]:hidden`}
                >
                  <span className={`${PINNED} ${CELL} flex-row items-center justify-start gap-2 bg-inherit`}>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 shrink-0 -rotate-90 text-slate-500 transition-transform group-open:rotate-0 motion-reduce:transition-none"
                    >
                      <path d="M4 6l4 4 4-4" />
                    </svg>
                    <span className="min-w-0 break-words">{lane.label}</span>
                  </span>
                  <span className={`${WIDE} ${CELL} font-semibold text-slate-600`}>{items.length}건</span>
                  <span className={`${WIDE} ${CELL} text-xs font-semibold text-violet-700`}>
                    {ongoing > 0 && `진행 ${ongoing}`}
                  </span>
                  <span aria-hidden="true" className="relative">
                    <span
                      className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-300"
                      style={place(laneStart, laneEnd)}
                    />
                  </span>
                </summary>

                <ol>
                  {items.map((item) => {
                    const active = item.ranges.some((range) => range.end === null);
                    const months = item.ranges.reduce(
                      (sum, range) => sum + rangeEnd(range) - toMonth(range.start),
                      0,
                    );

                    return (
                      <li key={item.label} className={`${ROW} border-t border-slate-100`}>
                        <span className={`${PINNED} ${CELL} bg-white font-semibold text-slate-800`}>
                          <span className="break-words">{item.label}</span>
                          <span className="text-[11px] font-normal leading-4 text-slate-500 sm:hidden">
                            {active ? '진행 중 · ' : ''}
                            {months}개월
                          </span>
                        </span>
                        <span className={`${WIDE} ${CELL}`}>
                          <span className="font-semibold text-slate-800">
                            {months}개월{active && '+'}
                          </span>
                          {item.ranges.map((range) => (
                            <span key={range.start} className="text-[11px] leading-4 text-slate-500">
                              {formatYm(range.start)}~{range.end ? formatYm(range.end) : ''}
                            </span>
                          ))}
                        </span>
                        <span className={`${WIDE} ${CELL} items-start`}>
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${
                              active ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`size-1.5 rounded-full ${active ? 'bg-violet-600' : 'bg-slate-400'}`}
                            />
                            {active ? '진행 중' : '완료'}
                          </span>
                        </span>
                        <span aria-hidden="true" className="relative">
                          {background}
                          {item.ranges.map((range) => (
                            <span
                              key={range.start}
                              className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-full ${
                                range.end ? 'bg-slate-300' : 'bg-violet-600'
                              }`}
                              style={place(toMonth(range.start), rangeEnd(range))}
                            />
                          ))}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </details>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
