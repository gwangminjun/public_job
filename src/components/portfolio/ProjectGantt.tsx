import type { ProjectSpan } from '@/app/portfolio/portfolio-data';

type ProjectGanttProps = {
  spans: ProjectSpan[];
  /** Chart window, `YYYY-MM`; ongoing ranges run to `until`. */
  from: string;
  until: string;
};

const KINDS = [
  { key: 'build', label: '구축·고도화', bar: 'bg-blue-600' },
  { key: 'operate', label: '운영·유지보수', bar: 'bg-teal-600' },
] as const;

const toMonth = (ym: string) => {
  const [year, month] = ym.split('-').map(Number);
  return year * 12 + month - 1;
};

const formatYm = (ym: string) => ym.replace('-', '.');

export function ProjectGantt({ spans, from, until }: ProjectGanttProps) {
  const start = toMonth(from);
  // Inclusive end month, so a one-month project still has width.
  const total = toMonth(until) + 1 - start;
  const pct = (month: number) => `${((month - start) / total) * 100}%`;

  const firstYear = Number(from.slice(0, 4));
  const years = Array.from(
    { length: Number(until.slice(0, 4)) - firstYear + 1 },
    (_, i) => firstYear + i,
  ).filter((year) => year * 12 >= start);

  return (
    <figure className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <span className="text-lg font-black text-slate-950">프로젝트 수행 기간</span>
        <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
          {KINDS.map((kind) => (
            <span key={kind.key} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`h-2.5 w-5 rounded-sm ${kind.bar}`} />
              {kind.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="text-xs font-bold text-slate-500">▸</span>
            진행 중
          </span>
        </span>
      </figcaption>

      {KINDS.map((kind) => (
        <div key={kind.key} className="mt-8">
          <h3 className="text-sm font-black text-slate-700">{kind.label}</h3>
          <ol className="mt-3">
            {spans
              .filter((span) => span.kind === kind.key)
              .map((span) => {
                const periods = span.ranges
                  .map((r) => `${formatYm(r.start)}~${r.end ? formatYm(r.end) : '진행 중'}`)
                  .join(', ');

                return (
                  <li
                    key={span.label}
                    title={`${span.label} · ${periods}`}
                    className="grid grid-cols-[7.5rem_1fr] items-center gap-3 py-1.5 sm:grid-cols-[12rem_1fr]"
                  >
                    <span className="break-words text-xs font-semibold leading-snug text-slate-700 sm:text-sm">
                      {span.label}
                      <span className="sr-only"> · {periods}</span>
                    </span>
                    <span aria-hidden="true" className="relative h-5">
                      {years.map((year) => (
                        <span
                          key={year}
                          className="absolute inset-y-0 w-px bg-slate-100"
                          style={{ left: pct(year * 12) }}
                        />
                      ))}
                      {span.ranges.map((range) => {
                        const left = toMonth(range.start);
                        const right = (range.end ? toMonth(range.end) : toMonth(until)) + 1;
                        return (
                          <span
                            key={range.start}
                            className={`absolute top-1/2 flex h-2.5 -translate-y-1/2 items-center justify-end rounded ${kind.bar}`}
                            style={{ left: pct(left), width: `calc(${pct(right)} - ${pct(left)})` }}
                          >
                            {range.end === null && (
                              <span className="translate-x-3 text-xs font-bold text-slate-500">▸</span>
                            )}
                          </span>
                        );
                      })}
                    </span>
                  </li>
                );
              })}
          </ol>
        </div>
      ))}

      <div aria-hidden="true" className="mt-2 grid grid-cols-[7.5rem_1fr] gap-3 sm:grid-cols-[12rem_1fr]">
        <span />
        <span className="relative h-5 text-xs text-slate-500">
          {years.map((year) => (
            <span key={year} className="absolute -translate-x-1/2" style={{ left: pct(year * 12) }}>
              {year}
            </span>
          ))}
        </span>
      </div>
    </figure>
  );
}
