import type { CaseStudyData } from '@/app/portfolio/portfolio-data';

type CaseStudyProps = {
  study: CaseStudyData;
  index: number;
};

const stages = [
  { key: 'problem', label: '문제' },
  { key: 'decision', label: '판단' },
  { key: 'implementation', label: '구현' },
  { key: 'result', label: '결과' },
] as const;

export function CaseStudy({ study, index }: CaseStudyProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-8 border-b border-slate-200 bg-slate-950 p-7 text-white lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
        <div>
          <p className="text-sm font-black tracking-[0.18em] text-cyan-300">
            CASE {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">{study.title}</h3>
          <p className="mt-3 leading-7 text-slate-300">{study.role}</p>
        </div>
        <p className="text-sm font-semibold text-slate-400 lg:text-right">{study.period}</p>
      </div>

      <div className="p-7 lg:p-10">
        <ul aria-label="사용 기술" className="flex flex-wrap gap-2">
          {study.technologies.map((technology) => (
            <li
              key={technology}
              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800"
            >
              {technology}
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="my-9 flex items-center">
          {stages.map((stage, stageIndex) => (
            <div key={stage.key} className="flex flex-1 items-center last:flex-none">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-black text-white">
                {stageIndex + 1}
              </span>
              {stageIndex < stages.length - 1 && <span className="h-px w-full bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {stages.map((stage) => (
            <section
              key={stage.key}
              className={`rounded-2xl border p-6 ${
                stage.key === 'result'
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h4
                className={`text-sm font-black ${
                  stage.key === 'result' ? 'text-teal-800' : 'text-blue-700'
                }`}
              >
                {stage.label}
              </h4>
              <p className="mt-3 leading-7 text-slate-700">{study[stage.key]}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
