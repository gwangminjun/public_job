import type { Highlight, Strength } from '@/app/portfolio/portfolio-data';

type ExperienceSummaryProps = {
  highlights: Highlight[];
  strengths: Strength[];
  employer: string;
};

export function ExperienceSummary({
  highlights,
  strengths,
  employer,
}: ExperienceSummaryProps) {
  return (
    <section aria-labelledby="profile-heading" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Profile & Resume</p>
          <h2 id="profile-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            개발부터 현장 운영까지
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">현재 경력</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{employer}</p>
          <p className="mt-3 leading-7 text-slate-600">
            도·시·군 정보시스템의 요구사항 분석, 개발, 서버 설치, 사용자 교육, 유지보수와 장애 대응을 담당했습니다.
          </p>
        </div>
      </div>

      <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((highlight) => (
          <div key={highlight.label} className="rounded-2xl bg-slate-950 p-6 text-white">
            <dt className="text-sm leading-6 text-slate-400">{highlight.label}</dt>
            <dd className="mt-2 text-2xl font-black tracking-tight text-cyan-300">{highlight.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Core strengths</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">반복해서 증명한 세 가지 역량</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {strengths.map((strength, index) => (
            <article key={strength.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-black text-blue-700">0{index + 1}</p>
              <h3 className="mt-4 text-xl font-black text-slate-950">{strength.title}</h3>
              <p className="mt-4 leading-7 text-slate-600">{strength.summary}</p>
              <p className="mt-6 border-t border-slate-100 pt-4 text-sm font-semibold leading-6 text-slate-500">
                {strength.evidence}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
